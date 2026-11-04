#!/usr/bin/env python3
"""Build a WordPress import file (WXR 1.2) from migration/.

Usage:
  python3 wordpress/import/build_wxr.py
      everything, for a fresh WordPress -> wordpress/import/scherma-content.xml
  python3 wordpress/import/build_wxr.py --only news,document --news-before 2015-06-05 \
      --documents dichiarazione-di-spese-nuova,modello-t1,modello-generale-divise,statuto-federale,regolamento-interno \
      --id-base 6000 --output wordpress/import/scherma-update-2026-11-04.xml
      a subset, to add content to an existing site

Import it in WordPress › Tools › Import › WordPress, with
"Download and import file attachments" checked. Media files are
downloaded from this public GitHub repository (main branch).

Post IDs start at ID_BASE so the importer can keep them: ACF file fields
reference attachment IDs, which the importer does not remap.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

import markdown
import yaml

ROOT = Path(__file__).resolve().parents[2]
MIGRATION = ROOT / 'migration'
OUTPUT = Path(__file__).with_name('scherma-content.xml')

MEDIA_BASE = 'https://raw.githubusercontent.com/ptesser/schermacastelfranco-cms/main/migration/'
SITE = 'https://cms.schermacastelfranco.it'
AUTHOR = 'redazione'
ID_BASE = 5000

NEWS_CATEGORIES = {'race': 'Gara', 'event': 'Evento', 'notice': 'Comunicazione'}

# ACF field keys, from wordpress/mu-plugins/scherma/acf-json/.
ACF_KEYS = {
    'post': {'location': 'field_scherma_news_location', 'results': 'field_scherma_news_results'},
    'course': {
        'weapon': 'field_scherma_course_weapon',
        'age_range': 'field_scherma_course_age',
        'schedule': 'field_scherma_course_schedule',
        'price': 'field_scherma_course_price',
        'instructor': 'field_scherma_course_instructor',
    },
    'staff': {'role': 'field_scherma_staff_role', 'qualification': 'field_scherma_staff_qualification'},
    'document': {
        'file': 'field_scherma_document_file',
        'year': 'field_scherma_document_year',
        'archived': 'field_scherma_document_archived',
    },
    'album': {'date': 'field_scherma_album_date', 'external_link': 'field_scherma_album_link'},
    'sponsor': {'url': 'field_scherma_sponsor_url'},
}

MIME = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
    '.pdf': 'application/pdf', '.doc': 'application/msword', '.zip': 'application/zip',
}


def cdata(value: str) -> str:
    return '<![CDATA[' + value.replace(']]>', ']]]]><![CDATA[>') + ']]>'


def load_json(name: str) -> list | dict:
    return json.loads((MIGRATION / 'data' / f'{name}.json').read_text(encoding='utf-8'))


class Builder:
    def __init__(self, id_base: int = ID_BASE) -> None:
        self.next_id = id_base
        self.attachments: list[str] = []
        self.by_path: dict[str, int] = {}
        self.items: list[str] = []

    def new_id(self) -> int:
        self.next_id += 1
        return self.next_id

    def attachment(self, relative: str, title: str, alt: str, parent: int, date: str) -> int:
        """relative: path as written in migration data, e.g. ../media/races/x.jpg"""
        path = relative.removeprefix('../')
        if path in self.by_path:  # same file used twice: import it once
            return self.by_path[path]
        if not (MIGRATION / path).is_file():
            raise FileNotFoundError(MIGRATION / path)
        post_id = self.new_id()
        self.by_path[path] = post_id
        url = MEDIA_BASE + path
        meta = {'_wp_attachment_image_alt': alt} if alt else {}
        self.attachments.append(self._item(
            post_id=post_id, post_type='attachment', title=title, slug=Path(path).stem.lower(),
            date=date, status='inherit', parent=parent, meta=meta,
            extra=f'\t\t<wp:attachment_url>{cdata(url)}</wp:attachment_url>\n',
            guid=url, mime=MIME[Path(path).suffix.lower()],
        ))
        return post_id

    def post(self, post_type: str, title: str, slug: str, date: str, *, content: str = '',
             excerpt: str = '', status: str = 'publish', order: int = 0, acf: dict | None = None,
             meta: dict | None = None, categories: list[tuple[str, str]] | None = None,
             post_id: int | None = None) -> int:
        post_id = post_id or self.new_id()
        all_meta = dict(meta or {})
        for name, value in (acf or {}).items():
            if value is None or value == '':
                continue
            all_meta[name] = str(value)
            all_meta['_' + name] = ACF_KEYS[post_type][name]
        self.items.append(self._item(
            post_id=post_id, post_type=post_type, title=title, slug=slug, date=date,
            status=status, content=content, excerpt=excerpt, order=order, meta=all_meta,
            categories=categories or [],
        ))
        return post_id

    @staticmethod
    def _item(*, post_id: int, post_type: str, title: str, slug: str, date: str, status: str,
              content: str = '', excerpt: str = '', parent: int = 0, order: int = 0,
              meta: dict, categories: list[tuple[str, str]] | None = None, extra: str = '',
              guid: str | None = None, mime: str = '') -> str:
        stamp = f'{date} 12:00:00'
        lines = [
            '\t<item>',
            f'\t\t<title>{cdata(title)}</title>',
            f'\t\t<link>{SITE}/?p={post_id}</link>',
            f'\t\t<dc:creator>{cdata(AUTHOR)}</dc:creator>',
            f'\t\t<guid isPermaLink="false">{escape(guid or f"{SITE}/?p={post_id}")}</guid>',
            '\t\t<description></description>',
            f'\t\t<content:encoded>{cdata(content)}</content:encoded>',
            f'\t\t<excerpt:encoded>{cdata(excerpt)}</excerpt:encoded>',
            f'\t\t<wp:post_id>{post_id}</wp:post_id>',
            f'\t\t<wp:post_date>{cdata(stamp)}</wp:post_date>',
            f'\t\t<wp:post_date_gmt>{cdata(stamp)}</wp:post_date_gmt>',
            f'\t\t<wp:post_modified>{cdata(stamp)}</wp:post_modified>',
            f'\t\t<wp:post_modified_gmt>{cdata(stamp)}</wp:post_modified_gmt>',
            '\t\t<wp:comment_status>closed</wp:comment_status>',
            '\t\t<wp:ping_status>closed</wp:ping_status>',
            f'\t\t<wp:post_name>{cdata(slug)}</wp:post_name>',
            f'\t\t<wp:status>{status}</wp:status>',
            f'\t\t<wp:post_parent>{parent}</wp:post_parent>',
            f'\t\t<wp:menu_order>{order}</wp:menu_order>',
            f'\t\t<wp:post_type>{post_type}</wp:post_type>',
            '\t\t<wp:post_password></wp:post_password>',
            '\t\t<wp:is_sticky>0</wp:is_sticky>',
        ]
        if mime:
            lines.append(f'\t\t<wp:post_mime_type>{mime}</wp:post_mime_type>')
        for slug_, name in categories or []:
            lines.append(f'\t\t<category domain="category" nicename="{slug_}">{cdata(name)}</category>')
        for key, value in meta.items():
            lines += [
                '\t\t<wp:postmeta>',
                f'\t\t\t<wp:meta_key>{cdata(key)}</wp:meta_key>',
                f'\t\t\t<wp:meta_value>{cdata(value)}</wp:meta_value>',
                '\t\t</wp:postmeta>',
            ]
        return '\n'.join(lines) + '\n' + extra + '\t</item>'


def build(only: set[str] | None = None, news_before: str | None = None,
          documents: set[str] | None = None, id_base: int = ID_BASE) -> str:
    def wanted(post_type: str) -> bool:
        return only is None or post_type in only

    b = Builder(id_base)
    today = datetime.now().strftime('%Y-%m-%d')

    # News
    for path in [] if not wanted('post') else sorted((MIGRATION / 'news').glob('*.md')):
        _, front, body = path.read_text(encoding='utf-8').split('---', 2)
        data = yaml.safe_load(front)
        if news_before and data['date'] >= news_before:
            continue
        post_id = b.new_id()
        meta = {}
        if data.get('image'):
            meta['_thumbnail_id'] = str(b.attachment(
                data['image'], data['title'], data['imageAlt'], post_id, data['date']))
        b.post('post', data['title'], path.stem, data['date'], post_id=post_id,
               content=markdown.markdown(body.strip()), meta=meta,
               acf={'location': data.get('location')},
               categories=[(data['category'], NEWS_CATEGORIES[data['category']])])

    # Courses
    for course in load_json('courses') if wanted('course') else []:
        b.post('course', course['title'], course['id'], today, order=course['order'],
               acf={'weapon': course['weapon'], 'age_range': course['ageRange'],
                    'schedule': course['schedule'], 'price': course['price'],
                    'instructor': course['instructor']})

    # Staff
    for person in load_json('staff') if wanted('staff') else []:
        post_id = b.new_id()
        meta = {}
        if person['photo']:
            meta['_thumbnail_id'] = str(b.attachment(
                person['photo'], person['name'], person['photoAlt'], post_id, today))
        b.post('staff', person['name'], person['id'], today, post_id=post_id,
               content=f"<p>{escape(person['bio'])}</p>" if person['bio'] else '',
               order=person['order'], meta=meta,
               acf={'role': person['role'], 'qualification': person['qualification']})

    # Documents
    for doc in load_json('documents') if wanted('document') else []:
        if documents and doc['id'] not in documents:
            continue
        post_id = b.new_id()
        date = f"{doc['year']}-01-01" if doc['year'] else today  # year unknown for some documents
        file_id = b.attachment(doc['file'], doc['title'], '', post_id, date)
        b.post('document', doc['title'], doc['id'], date, post_id=post_id,
               acf={'file': file_id, 'year': doc['year'], 'archived': int(doc['archived'])})

    # Albums (dead links are imported without a link, as on the site)
    for album in load_json('albums') if wanted('album') else []:
        post_id = b.new_id()
        meta = {}
        if album.get('cover'):
            meta['_thumbnail_id'] = str(b.attachment(
                album['cover'], album['title'], album.get('coverAlt', ''), post_id, album['date']))
        date = album['date']
        b.post('album', album['title'], album['id'], date or today, post_id=post_id, meta=meta,
               acf={'date': date.replace('-', '') if date else None,  # ACF stores Ymd
                    'external_link': album['externalLink']})

    # Sponsors
    for sponsor in load_json('sponsors') if wanted('sponsor') else []:
        post_id = b.new_id()
        meta = {}
        if sponsor.get('logo'):
            meta['_thumbnail_id'] = str(b.attachment(
                sponsor['logo'], sponsor['name'], f"Logo {sponsor['name']}", post_id, today))
        b.post('sponsor', sponsor['name'], sponsor['id'], today, post_id=post_id,
               order=sponsor['order'], meta=meta, acf={'url': sponsor['url']})

    return wrap(b)


def wrap(b: Builder) -> str:
    categories = '\n'.join(
        f'\t<wp:category><wp:category_nicename>{slug}</wp:category_nicename>'
        f'<wp:category_parent></wp:category_parent><wp:cat_name>{cdata(name)}</wp:cat_name></wp:category>'
        for slug, name in NEWS_CATEGORIES.items()
    )

    # Attachments first, so they exist before the posts that use them.
    body = '\n'.join(b.attachments + b.items)
    return f'''<?xml version="1.0" encoding="UTF-8" ?>
<!-- Generated by wordpress/import/build_wxr.py from migration/. Do not edit by hand. -->
<rss version="2.0"
\txmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
\txmlns:content="http://purl.org/rss/1.0/modules/content/"
\txmlns:wfw="http://wellformedweb.org/CommentAPI/"
\txmlns:dc="http://purl.org/dc/elements/1.1/"
\txmlns:wp="http://wordpress.org/export/1.2/">
<channel>
\t<title>Circolo Scherma Castelfranco Veneto</title>
\t<link>{SITE}</link>
\t<description>Contenuti migrati dal vecchio sito</description>
\t<language>it-IT</language>
\t<wp:wxr_version>1.2</wp:wxr_version>
\t<wp:base_site_url>{SITE}</wp:base_site_url>
\t<wp:base_blog_url>{SITE}</wp:base_blog_url>
\t<wp:author><wp:author_id>1</wp:author_id><wp:author_login>{cdata(AUTHOR)}</wp:author_login><wp:author_email></wp:author_email><wp:author_display_name>{cdata('Redazione')}</wp:author_display_name><wp:author_first_name></wp:author_first_name><wp:author_last_name></wp:author_last_name></wp:author>
{categories}
{body}
</channel>
</rss>
'''


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--only', help='comma-separated post types: post,course,staff,document,album,sponsor')
    parser.add_argument('--news-before', help='only news dated before YYYY-MM-DD')
    parser.add_argument('--documents', help='comma-separated document ids from migration/data/documents.json')
    parser.add_argument('--id-base', type=int, default=ID_BASE, help='first post ID minus one')
    parser.add_argument('--output', type=Path, default=OUTPUT)
    args = parser.parse_args()
    output = args.output.resolve()
    split = lambda value: set(value.split(',')) if value else None
    output.write_text(build(split(args.only), args.news_before, split(args.documents), args.id_base), encoding='utf-8')
    print(f'Wrote {output.relative_to(ROOT)}')
