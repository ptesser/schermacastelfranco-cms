<?php
/**
 * Plugin Name: Scherma Castelfranco — headless CMS
 * Description: Content types, REST setup and site rebuild trigger for the Astro site.
 * Version: 0.1.0
 * Requires PHP: 8.2
 *
 * Must-use plugin: copy this file and the `scherma/` folder into wp-content/mu-plugins/.
 */

defined('ABSPATH') || exit;

require_once __DIR__ . '/scherma/post-types.php';
require_once __DIR__ . '/scherma/acf.php';
require_once __DIR__ . '/scherma/club-settings.php';
require_once __DIR__ . '/scherma/editorial.php';
require_once __DIR__ . '/scherma/headless.php';
require_once __DIR__ . '/scherma/deploy-hook.php';
