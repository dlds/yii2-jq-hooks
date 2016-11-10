<?php

/**
 * @copyright Copyright (c) 2014 Digital Deals s.r.o.
 * @license http://www.digitaldeals.cz/license/
 */

namespace dlds\jqhooks\assets;

use yii\web\AssetBundle;

class JqHooksAsset extends AssetBundle
{

    /**
     * @var string source assets path
     */
    public $sourcePath = '@dlds/jqhooks/assets';

    /**
     * @var array css assets
     */
    public $css = [];

    /**
     * @var array js assets
     */
    public $js = [
        'js/jq.hooks.js',
    ];

    /**
     * @var array depended packages
     */
    public $depends = [
        'yii\web\JqueryAsset',
    ];

}
