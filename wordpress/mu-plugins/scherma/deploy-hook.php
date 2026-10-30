<?php
/**
 * Rebuild the public site when content is published, updated or unpublished.
 * Define SCHERMA_DEPLOY_HOOK_URL (Cloudflare Pages deploy hook) in wp-config.php.
 * Requests are throttled so a burst of saves triggers a single build.
 */

defined('ABSPATH') || exit;

const SCHERMA_DEPLOY_THROTTLE = 60; // seconds

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

function scherma_trigger_deploy(): void
{
    if (!defined('SCHERMA_DEPLOY_HOOK_URL') || get_transient('scherma_deploy_pending')) {
        return;
    }

    set_transient('scherma_deploy_pending', 1, SCHERMA_DEPLOY_THROTTLE);
    wp_remote_post(SCHERMA_DEPLOY_HOOK_URL, ['blocking' => false, 'timeout' => 5]);
}
