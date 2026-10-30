<?php
/**
 * Custom post types and news categories.
 * Admin labels are in Italian for the club volunteers.
 */

defined('ABSPATH') || exit;

const SCHERMA_POST_TYPES = [
    'course' => [
        'rest_base' => 'courses',
        'singular'  => 'Corso',
        'plural'    => 'Corsi',
        'icon'      => 'dashicons-groups',
        'supports'  => ['title', 'editor', 'page-attributes'],
    ],
    'staff' => [
        'rest_base' => 'staff',
        'singular'  => 'Persona dello staff',
        'plural'    => 'Staff',
        'icon'      => 'dashicons-id',
        'supports'  => ['title', 'editor', 'thumbnail', 'page-attributes'],
    ],
    'document' => [
        'rest_base' => 'documents',
        'singular'  => 'Documento',
        'plural'    => 'Documenti',
        'icon'      => 'dashicons-media-document',
        'supports'  => ['title', 'excerpt'],
    ],
    'album' => [
        'rest_base' => 'albums',
        'singular'  => 'Album',
        'plural'    => 'Galleria',
        'icon'      => 'dashicons-format-gallery',
        'supports'  => ['title', 'thumbnail'],
    ],
    'sponsor' => [
        'rest_base' => 'sponsors',
        'singular'  => 'Sponsor',
        'plural'    => 'Sponsor',
        'icon'      => 'dashicons-heart',
        'supports'  => ['title', 'thumbnail', 'page-attributes'],
    ],
    'event' => [
        'rest_base' => 'events',
        'singular'  => 'Appuntamento',
        'plural'    => 'Appuntamenti',
        'icon'      => 'dashicons-calendar-alt',
        'supports'  => ['title'],
    ],
];

/** News categories: slug => label. Slugs match the Astro schema. */
const SCHERMA_NEWS_CATEGORIES = [
    'race'   => 'Gara',
    'event'  => 'Evento',
    'notice' => 'Comunicazione',
];

add_action('init', static function (): void {
    foreach (SCHERMA_POST_TYPES as $type => $config) {
        register_post_type($type, [
            'labels'        => [
                'name'          => $config['plural'],
                'singular_name' => $config['singular'],
                'add_new_item'  => 'Aggiungi ' . strtolower($config['singular']),
                'edit_item'     => 'Modifica ' . strtolower($config['singular']),
            ],
            'public'        => true,
            'show_in_rest'  => true,
            'rest_base'     => $config['rest_base'],
            'menu_icon'     => $config['icon'],
            'supports'      => $config['supports'],
            'has_archive'   => false,
            'rewrite'       => false,
        ]);
    }

    foreach (SCHERMA_NEWS_CATEGORIES as $slug => $label) {
        if (!term_exists($slug, 'category')) {
            wp_insert_term($label, 'category', ['slug' => $slug]);
        }
    }
});
