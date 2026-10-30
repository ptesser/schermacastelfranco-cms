<?php
/**
 * ACF (free) field groups are versioned as JSON in `scherma/acf-json/`.
 * Edits made in the admin are saved back to that folder.
 */

defined('ABSPATH') || exit;

add_filter('acf/settings/save_json', static fn (): string => __DIR__ . '/acf-json');

add_filter('acf/settings/load_json', static function (array $paths): array {
    $paths[] = __DIR__ . '/acf-json';
    return $paths;
});

add_action('admin_notices', static function (): void {
    if (!function_exists('acf_get_field_groups') && current_user_can('activate_plugins')) {
        echo '<div class="notice notice-error"><p>Il sito richiede il plugin <strong>Advanced Custom Fields</strong>: installalo e attivalo.</p></div>';
    }
});
