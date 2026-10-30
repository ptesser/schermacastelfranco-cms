<?php
/**
 * Editorial rules for volunteers: alt text is required, comments are off.
 */

defined('ABSPATH') || exit;

/** Refuse to publish content whose featured image has no alt text. */
add_action('init', static function (): void {
    foreach (array_merge(['post'], array_keys(SCHERMA_POST_TYPES)) as $type) {
        add_filter("rest_pre_insert_{$type}", 'scherma_require_featured_image_alt', 10, 2);
    }
}, 20);

function scherma_require_featured_image_alt(stdClass|WP_Error $prepared, WP_REST_Request $request): stdClass|WP_Error
{
    if (is_wp_error($prepared)) {
        return $prepared;
    }

    $status = $request['status'] ?? get_post_status($prepared->ID ?? 0);
    $mediaId = $request['featured_media'] ?? get_post_thumbnail_id($prepared->ID ?? 0);

    if ($status !== 'publish' || !$mediaId) {
        return $prepared;
    }

    $alt = trim((string) get_post_meta((int) $mediaId, '_wp_attachment_image_alt', true));
    if ($alt === '') {
        return new WP_Error(
            'scherma_missing_alt',
            "Aggiungi il testo alternativo all'immagine in evidenza (Libreria media → Testo alternativo) prima di pubblicare.",
            ['status' => 400],
        );
    }

    return $prepared;
}

add_filter('comments_open', '__return_false', 20);
add_filter('pings_open', '__return_false', 20);

add_action('admin_menu', static function (): void {
    remove_menu_page('edit-comments.php');
});
