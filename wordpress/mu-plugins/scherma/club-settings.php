<?php
/**
 * "Dati del circolo" settings page and a public read-only REST endpoint:
 * GET /wp-json/scherma/v1/club
 */

defined('ABSPATH') || exit;

const SCHERMA_CLUB_OPTION = 'scherma_club';

/** Field key => [label, type]. */
const SCHERMA_CLUB_FIELDS = [
    'email'          => ['Email', 'email'],
    'phone'          => ['Telefono', 'text'],
    'pec'            => ['PEC', 'email'],
    'contact_person' => ['Referente', 'text'],
    'contact_role'   => ['Ruolo del referente', 'text'],
    'tax_code'       => ['Codice fiscale', 'text'],
    'iban'           => ['IBAN', 'text'],
    'venue_name'     => ['Nome della sede', 'text'],
    'venue_address'  => ['Indirizzo della sede', 'text'],
    'venue_city'     => ['Città', 'text'],
    'maps_url'       => ['Link a Google Maps', 'url'],
    'opening_hours'  => ['Orari (uno per riga, es. "Lunedì 17:00-21:30")', 'textarea'],
];

add_action('admin_init', static function (): void {
    register_setting('scherma_club', SCHERMA_CLUB_OPTION, [
        'type'              => 'array',
        'default'           => [],
        'sanitize_callback' => 'scherma_sanitize_club',
    ]);

    add_settings_section('scherma_club_main', '', '__return_false', 'scherma-club');

    foreach (SCHERMA_CLUB_FIELDS as $key => [$label, $type]) {
        add_settings_field($key, $label, 'scherma_render_club_field', 'scherma-club', 'scherma_club_main', [
            'key'       => $key,
            'type'      => $type,
            'label_for' => "scherma-club-$key",
        ]);
    }
});

function scherma_sanitize_club(mixed $input): array
{
    $input = is_array($input) ? $input : [];
    $clean = [];
    foreach (SCHERMA_CLUB_FIELDS as $key => [, $type]) {
        $value = $input[$key] ?? '';
        $clean[$key] = match ($type) {
            'email'    => sanitize_email($value),
            'url'      => esc_url_raw($value),
            'textarea' => sanitize_textarea_field($value),
            default    => sanitize_text_field($value),
        };
    }
    return $clean;
}

function scherma_render_club_field(array $args): void
{
    $values = get_option(SCHERMA_CLUB_OPTION, []);
    $name   = SCHERMA_CLUB_OPTION . "[{$args['key']}]";
    $value  = $values[$args['key']] ?? '';

    if ($args['type'] === 'textarea') {
        printf('<textarea id="%s" name="%s" rows="5" class="large-text">%s</textarea>', esc_attr($args['label_for']), esc_attr($name), esc_textarea($value));
        return;
    }

    printf('<input id="%s" name="%s" type="%s" value="%s" class="regular-text">', esc_attr($args['label_for']), esc_attr($name), esc_attr($args['type']), esc_attr($value));
}

add_action('admin_menu', static function (): void {
    add_menu_page('Dati del circolo', 'Dati del circolo', 'edit_others_posts', 'scherma-club', static function (): void {
        echo '<div class="wrap"><h1>Dati del circolo</h1><form method="post" action="options.php">';
        settings_fields('scherma_club');
        do_settings_sections('scherma-club');
        submit_button();
        echo '</form></div>';
    }, 'dashicons-building', 3);
});

/** Editors (not only admins) may save the club settings. */
add_filter('option_page_capability_scherma_club', static fn (): string => 'edit_others_posts');

add_action('rest_api_init', static function (): void {
    register_rest_route('scherma/v1', '/club', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => static fn (): array => array_merge(
            array_fill_keys(array_keys(SCHERMA_CLUB_FIELDS), ''),
            get_option(SCHERMA_CLUB_OPTION, []),
        ),
    ]);
});
