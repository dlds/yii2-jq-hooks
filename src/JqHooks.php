<?php

/**
 * @link http://www.digitaldeals.cz/
 * @copyright Copyright (c) 2016 Digital Deals s.r.o.
 * @license http://www.digitaldeals.cz/license/
 * @author Jiri Svoboda <jiri.svoboda@dlds.cz>
 */

namespace dlds\jqhooks;

use yii\helpers\ArrayHelper;

/**
 * This is the main module class for the Giixer module.
 * Giixer module replaces default Gii module and enhances default functionality.
 *
 * @author Jiri Svoboda <jiri.svoboda@dlds.cz>
 */
class JqHooks extends \yii\base\Module
{

    /**
     * Available actions
     */
    const ACT_OPEN = 'open';
    const ACT_CLOSE = 'close';
    const ACT_SHOW = 'show';
    const ACT_HIDE = 'hide';
    const ACT_TOGGLE = 'toggle';
    const ACT_CHECK = 'check';
    const ACT_UNCHECK = 'uncheck';
    const ACT_FOCUS = 'focus';
    const ACT_BLUR = 'blur';
    const ACT_TRIGGER = 'trigger';
    
    
    /**
     * @var boolean
     */
    private static $_inits = [];

    /**
     * Retrievese ternary action definition
     * @param string $positive
     * @param string $negative
     * @return string
     */
    public static function ternary($positive, $negative)
    {
        return sprintf('%s:%s', $positive, $negative);
    }

    /**
     * Retreives hook action definition
     * @param array $had
     * @param boolean $init
     * @return \yii\web\JsExpression
     */
    public static function attach($had, $init = true)
    {
        if ($init) {
            static::initJs();
        }

        return $had;
    }

    /**
     * Runs JqHooks initialization
     * @param string $id
     * @param boolean $force
     */
    public static function initJs($id = '', $force = false)
    {
        if ($force || !static::isJsInit($id)) {
            static::jsAsset($id);
        }
    }

    /**
     * Indicates if JqHooks are initialized on given element or globally
     * @param string $id
     * @return boolean
     */
    protected static function isJsInit($id = '')
    {
        if (!$id) {
            return ArrayHelper::isIn('global', static::$_inits, false);
        }

        return ArrayHelper::isIn($id, static::$_inits, false);
    }

    /**
     * Registeres and init jq hooks assets
     * @param string $id
     */
    protected static function jsAsset($id = '')
    {
        assets\JqHooksAsset::register(\Yii::$app->view);

        \Yii::$app->view->registerJs("
            Hooks.init('$id');
        ");

        if (!$id) {
            return array_push(static::$_inits, 'global');
        }

        return array_push(static::$_inits, $id);
    }

}
