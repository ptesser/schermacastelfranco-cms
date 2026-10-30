<?php
/**
 * WordPress is the admin panel only: public visits are sent to the Astro site.
 * Until launch the target is the test site; define SCHERMA_PUBLIC_URL in
 * wp-config.php to override it (e.g. https://www.schermacastelfranco.it).
 */

defined('ABSPATH') || exit;

add_action('template_redirect', static function (): void {
    if (is_user_logged_in() && is_preview()) {
        return;
    }

    $target = defined('SCHERMA_PUBLIC_URL') ? SCHERMA_PUBLIC_URL : 'https://test.schermacastelfranco.it';
    wp_redirect($target, 301);
    exit;
});

/** Keep the admin and the REST API out of search engines. */
add_filter('wp_robots', static fn (array $robots): array => ['noindex' => true, 'nofollow' => true] + $robots);
