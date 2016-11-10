<?php

/**
 * @link http://www.digitaldeals.cz/
 * @copyright Copyright (c) 2016 Digital Deals s.r.o.
 * @license http://www.digitaldeals.cz/license/
 * @author Jiri Svoboda <jiri.svoboda@dlds.cz>
 */

namespace dlds\jqhooks;

/**
 * This is the main module class for the Giixer module.
 * Giixer module replaces default Gii module and enhances default functionality.
 *
 * @author Jiri Svoboda <jiri.svoboda@dlds.cz>
 */
class JqHooks extends \yii\gii\Module
{

    /**
     * Retreives hook action definition
     * @param array $had
     * @param string $id
     * @return \yii\web\JsExpression
     */
    public static function attach($had, $id)
    {
        static::jsAsset($id);
        return $had;
    }

    /**
     * Registeres and init jq hooks assets
     * @param string $id
     */
    protected static function jsAsset($id)
    {
        assets\JqHooksAsset::register(\Yii::$app->view);

        \Yii::$app->view->registerJs("
            Hooks.init('$id');
        ");
    }

}
