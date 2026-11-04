<?php
/**
 * Rebuild the public site when content is published, updated or unpublished.
 *
 * The Cloudflare Pages deploy hook URL is read from the SCHERMA_DEPLOY_HOOK_URL
 * constant in wp-config.php if defined, otherwise from Settings › Pubblicazione sito
 * (admins only, stored in the database, never exposed through the REST API).
 * Requests are throttled so a burst of saves triggers a single build.
 */

defined('ABSPATH') || exit;

const SCHERMA_DEPLOY_THROTTLE = 60; // seconds
const SCHERMA_DEPLOY_OPTION   = 'scherma_deploy_hook_url';
const SCHERMA_DEPLOY_PREFIX   = 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/';

add_action('transition_post_status', static function (string $new, string $old, WP_Post $post): void {
    $tracked = array_merge(['post', 'page', 'attachment'], array_keys(SCHERMA_POST_TYPES));
    if (!in_array($post->post_type, $tracked, true)) {
        return;
    }
    if ($new !== 'publish' && $old !== 'publish') {
        return;
    }
    if (wp_is_post_revision($post) || wp_is_post_autosave($post)) {
        return;
    }
    scherma_trigger_deploy();
}, 10, 3);

add_action('update_option_' . SCHERMA_CLUB_OPTION, 'scherma_trigger_deploy');

function scherma_deploy_hook_url(): string
{
    if (defined('SCHERMA_DEPLOY_HOOK_URL')) {
        return (string) SCHERMA_DEPLOY_HOOK_URL;
    }
    return (string) get_option(SCHERMA_DEPLOY_OPTION, '');
}

function scherma_trigger_deploy(): void
{
    $url = scherma_deploy_hook_url();
    if ($url === '' || get_transient('scherma_deploy_pending')) {
        return;
    }

    set_transient('scherma_deploy_pending', 1, SCHERMA_DEPLOY_THROTTLE);
    wp_remote_post($url, ['blocking' => false, 'timeout' => 5]);
}

/* Settings › Pubblicazione sito */

add_action('admin_init', static function (): void {
    register_setting('scherma_deploy', SCHERMA_DEPLOY_OPTION, [
        'type'              => 'string',
        'default'           => '',
        'show_in_rest'      => false,
        'sanitize_callback' => 'scherma_sanitize_deploy_hook',
    ]);
});

/** Keeps the stored URL when the field is left empty; accepts only Cloudflare Pages deploy hooks. */
function scherma_sanitize_deploy_hook(mixed $input): string
{
    $current = (string) get_option(SCHERMA_DEPLOY_OPTION, '');

    if (!empty($_POST['scherma_deploy_remove'])) {
        return '';
    }

    $url = trim((string) $input);
    if ($url === '') {
        return $current;
    }
    if (!str_starts_with($url, SCHERMA_DEPLOY_PREFIX)) {
        add_settings_error(SCHERMA_DEPLOY_OPTION, 'invalid', 'L’URL deve essere un deploy hook di Cloudflare Pages (inizia con ' . SCHERMA_DEPLOY_PREFIX . ').');
        return $current;
    }
    return esc_url_raw($url);
}

add_action('admin_menu', static function (): void {
    add_options_page('Pubblicazione sito', 'Pubblicazione sito', 'manage_options', 'scherma-deploy', 'scherma_render_deploy_page');
});

function scherma_render_deploy_page(): void
{
    $fromConfig = defined('SCHERMA_DEPLOY_HOOK_URL');
    $configured = scherma_deploy_hook_url() !== '';

    echo '<div class="wrap"><h1>Pubblicazione sito</h1>';
    echo '<p>Quando un contenuto viene pubblicato o modificato, WordPress chiede a Cloudflare Pages di ricostruire il sito pubblico (al massimo una volta al minuto).</p>';
    printf(
        '<p><strong>Stato:</strong> %s</p>',
        $configured
            ? ($fromConfig ? 'configurato in <code>wp-config.php</code> (ha la precedenza su questa pagina).' : 'configurato.')
            : 'non configurato: le modifiche non vengono pubblicate automaticamente.'
    );

    echo '<form method="post" action="options.php">';
    settings_fields('scherma_deploy');
    echo '<table class="form-table" role="presentation"><tr>';
    printf('<th scope="row"><label for="scherma-deploy-url">Deploy hook URL</label></th>');
    printf(
        '<td><input id="scherma-deploy-url" name="%s" type="password" class="large-text" autocomplete="off" placeholder="%s" %s>',
        esc_attr(SCHERMA_DEPLOY_OPTION),
        esc_attr($configured ? 'Già impostato: lascia vuoto per non cambiarlo' : SCHERMA_DEPLOY_PREFIX . '…'),
        $fromConfig ? 'disabled' : ''
    );
    echo '<p class="description">Cloudflare › Workers &amp; Pages › schermacastelfranco-cms › Settings › Deploy hooks. Trattalo come una password.</p>';
    if ($configured && !$fromConfig) {
        echo '<p><label><input type="checkbox" name="scherma_deploy_remove" value="1"> Rimuovi l’URL salvato</label></p>';
    }
    echo '</td></tr></table>';
    if (!$fromConfig) {
        submit_button();
    }
    echo '</form></div>';
}
