/*!
 * Action hooks
 * ---
 * @author Jirka Svoboda<jiri.svoboda@dlds.cz> Digital Deals s.r.o.
 * ---
 * Hooks is used when standart JS operation like show, hide, toggle, ... 
 * are required to attach with conditional performance.
 * ---
 * E.g. You want to show 'overlay' html element when user clicks on 'trigger' html element.
 * With Action hooks you have to do:
 * 1. Register hook: <div class="my-custom-overlay-class" data-hook="overlay"></div>
 * 2. Register trigger: <a class="my-custom-trigger-class" data-had="{"click":[["show","overlay"]]}"></div>
 * ---
 * Each registered hook must have data-hook="{hookName}" attribute.
 * Each trigger element must have data-had="{hookActionDefinition}" attribute
 * ---
 * 1. Hook action definition (data-had) short format: {
 *      'jqEevent' => [
 *          ['hookActionName' 'hookName', 'hookActionCondition'],
 *      ]
 * }
 * ---
 * 2. Hook action definition (data-had) full format: {
 *      'jqEevent' => [
 *          [
 *              'act' => 'hookActionName' 
 *              'hook' => 'hookName', 
 *              'cdn' => 'hookActionCondition', 
 *              'attrs' => 'hookActionParams',
 *              'cache' => 'true',
 *          ],
 *      ]
 * }
 * 
 * Where following attrs stand for:
 * 
 * 1. jqEvent: classic jQuery event like 'change', 'click', ...
 * 
 * 2. hookActionName: Action hooks lib offered methods. See bellow every method
 * prefixed with 'do' (doClose, doOpen, doToggle, ...)
 * 
 * 3. hookName: custom string which reflects value of 'data-hook' attr assigned to target element
 *
 * 4. hookActionParams: optional action params that will be pushed to action
 * 
 * 4. hookActionCondition: callback or simple fn definition which will be processed as js function.
 * This condition allows you to define when the action will be processed.
 * ---
 * You can specify ternary condition like following: {
 *      'click' => [
 *          ['show:hide' 'overlay', 'return this.val() === 1'],
 *      ]
 * }
 * This definitios runs 'show' action if clicked element value === 1 otherwise it runs 'hide' action.
 * ---
 * @see https://api.jquery.com/category/events/
 */

/**
 * ===
 * Hooks config class
 * ===
 * @type CfgHooks
 */

var CfgHooks = function (_had, _node) {

    /**
     * Configuration params
     * @type Object
     */
    var _cfg = {
        act: null,
        hook: null,
        cdn: true,
        cache: false,
        attrs: [],
        node: null,
        prevent: true,
    }

    /**
     * Initializer
     * @param {Array|Object} had
     * @param {jQuery} node
     * @returns {null}
     */
    var _init = function (had, node) {

        if (had instanceof Array) {
            had = {
                act: had[0] || null,
                hook: had[1] || null,
                cdn: had[2] || true,
            };
        }

        jQuery.extend(_cfg, had);

        _cfg.node = node;
    }

    // autorun
    _init.apply(this, [_had, _node]);

    /**
     * Returns action name
     * @returns {String}
     */
    this.getActionName = function () {
        return _cfg.act;
    }

    /**
     * Returns hook name
     * @returns {String}
     */
    this.getHookName = function () {
        return _cfg.hook;
    }

    /**
     * Returns action attributes
     * @returns {String|Object|Array}
     */
    this.getActionAttrs = function () {
        return _cfg.attrs;
    }

    /**
     * Returns trigger element
     * @returns {jQuery}
     */
    this.getTriggerNode = function () {
        return _cfg.node;
    }

    /**
     * Indicates if action is allowed
     * @returns {String}
     */
    this.isAllowed = function () {
        return this.cdn(_cfg.cdn, this.getTriggerNode());
    }

    /**
     * Indicates if cache is allowed
     * @returns {String}
     */
    this.isCacheable = function () {
        return _cfg.cache;
    }

    /**
     * Indicates if default action is prevented
     * @returns {String}
     */
    this.isDefaultPrevented = function () {
        return _cfg.prevent;
    }
};

/**
 * Indicates if action is doable
 * ---
 * Runs and retrieve result of 'hookActionCondition'
 * ---
 * @returns {boolean}
 */
CfgHooks.prototype.cdn = function (cdn, node) {

    if (false === cdn || true === cdn) {
        return cdn;
    }

    var fn = new Function(cdn);
    return fn.apply(node);
}

/**
 * ===
 * Hooks main class
 * ===
 * @type Hooks
 */
var Hooks = (function () {

    /**
     * Hooks cache
     * @type {Object}
     */
    var cache = {
        hooks: {}
    };

    /**
     * Ensures that given node is jQuery object
     * @param {String|jQuery} node
     * @returns {jQuery|$}
     */
    var _jq = function (node) {
        if (!(node instanceof jQuery)) {
            node = jQuery(node);
        }

        return node;
    }

    /**
     * Retrieves hook action definition for give event
     * ---
     * @param jQuery|String node
     * @param String evt jqEEvent name
     * @returns {Boolean}|Collection
     */
    var _defs = function (node, evt) {

        if (!node) {
            return false;
        }

        var defs = _jq(node).data('had');

        if (evt === undefined) {
            return defs;
        }

        return defs[evt] || false;
    }

    /**
     * Finds all childs elements of given parent (context)
     * ---
     * Checks if parent element is defined otherwise set document as parent.
     * ---
     * @param Selector selector
     * @param Object parent
     * @returns {Boolean}|Collection
     */
    var _nodes = function (context) {

        // get document as parent if explicit parent is not given
        if (!context || !context.length) {
            context = jQuery(document);
        }

        // find all elements basen on given selector
        var elements = _jq(context).find('[data-had]');

        // if no element exists return FALSE
        if (!elements.length) {
            return false;
        }

        return elements;
    }

    /**
     * Finds and retrieves all hooks with assigned hookNname
     * ---
     * @param {CfgHooks} cfg
     * @param String name given hookName
     * @return Object
     */
    var _hooks = function (cfg) {

        var name = cfg.getHookName();

        // use trigger itself when hookName is not set
        if (!name) {
            return cfg.getTriggerNode();
        }

        // cache hooks if they are not yet
        if (!cache.hooks.hasOwnProperty(name) || null === cache.hooks[name] || !cfg.isCacheable()) {
            cache.hooks[name] = jQuery('[data-hook="' + name + '"]');

            // try css selector if no data-hook is found
            if (!cache.hooks[name].length) {
                cache.hooks[name] = _jqHook(name, cfg.getTriggerNode());
            }
        }

        // debug hooks
        //console.log(cache.hooks[name]);

        // retrieves cached hooks
        return cache.hooks[name];
    };

    /**
     * Finds and hook using extended jQuery selectors
     * ---
     * @param {CfgHooks} cfg
     * @param String node given node
     * @return Object
     */
    var _jqHook = function (expr, node) {

        if (0 == expr.indexOf('closest ')) {
            return node.closest(expr.substr(8));
        }

        if (0 == expr.indexOf('find ')) {
            return node.find(expr.substr(5));
        }

        return _jq(expr);
    }

    /**
     * Run action based on hook action definition
     * @param {Event} e
     * @param {Array} had
     * @param {jQuery} node
     * @returns {boolean}
     */
    var _do = function (e, had, node) {

        var config = new CfgHooks(had, node);

        if (config.isDefaultPrevented()) {
            e.preventDefault();
        }

        // get action fn name
        var fn = _fn(config);

        if (false === fn) {
            return false;
        }

        var hooks = _hooks(config);

        // run action
        switch (fn) {
            case 'do':
                return doJs(config);
            case 'open':
                return doOpen(hooks);
            case 'close':
                return doClose(hooks);
            case 'scroll':
                return doScroll(hooks, config);
            case 'show':
                return doShow(hooks);
            case 'hide':
                return doHide(hooks);
            case 'toggle':
                return doToggle(hooks);
            case 'remove':
                return doRemove(hooks);
            case 'clear':
                return doClear(hooks);
            case 'check':
                return doCheck(hooks);
            case 'uncheck':
                return doUncheck(hooks);
            case 'focus':
                return doFocus(hooks);
            case 'blur':
                return doBlur(hooks);
            case 'trigger':
                return doTrigger(hooks, config);
            case 'class-add':
                return doClassAdd(hooks, config);
            case 'class-rmw':
                return doClassRmw(hooks, config);
            case 'class-tgl':
                return doClassTgl(hooks, config);
            case 'input-clear':
                return doInputClear(hooks);
            case 'input-clear-all':
                return doInputClearAll(hooks);
            case 'input-val':
                return doInputVal(hooks, config);
            case 'submit':
                return doSubmit(hooks);
        }

        // erase config object reference
        config = null;
    };

    /**
     * Retrieves action function name
     * @param {CfgHooks} cfg
     * @returns {String}
     */
    var _fn = function (cfg) {

        var ternary = _ternary(cfg.getActionName());

        if (!cfg.isAllowed()) {
            return ternary.negative;
        }

        return ternary.positive;
    }

    /**
     * Makes ternary condition from action name
     * @param {type} had
     * @returns {Object}
     */
    var _ternary = function (df) {

        var opts = {
            positive: false,
            negative: false,
        };

        if (false === df) {
            return opts;
        }

        var names = df.split(':');

        if (!jQuery.isArray(names)) {
            opts.positive = df;
            return opts;
        }

        opts.positive = names[0] || false;
        opts.negative = names[1] || false;

        return opts;
    }

    /**
     * Process js callback
     */
    var doJs = function (config) {

        var fn = new Function(config.getActionAttrs());
        fn.apply(this);

        //console.log('[done] doJs');
    };

    /**
     * Open all targeted elements
     */
    var doOpen = function (hooks) {

        if (hooks) {
            hooks.addClass('open').trigger('open');
        }

        //console.log('[done] doOpen');
    };

    /**
     * Close all targeted elements
     */
    var doClose = function (hooks) {

        if (hooks) {
            hooks.removeClass('open').trigger('close');
        }

        //console.log('[done] doClose');
    };

    /**
     * Scroll all targeted elements
     * @param {Object} hooks
     * @param {CfgHooks} config 
     */
    var doScroll = function (hooks, config) {

        if (hooks) {

            var position = _jq(hooks.get(0)).offset().top;

            if (config.getActionAttrs().offset) {
                position += config.getActionAttrs().offset;
            }

            var delay = config.getActionAttrs().delay || 1000;

            jQuery('html, body').animate({scrollTop: position}, delay);
        }

        //console.log('[done] doScroll');
    };

    /**
     * Shows all targeted checkboxes
     */
    var doShow = function (hooks) {

        if (hooks) {
            hooks.show();
        }

        //console.log('[done] doShow');
    };

    /**
     * Hide all targeted checkboxes
     */
    var doHide = function (hooks) {

        if (hooks) {
            hooks.hide();
        }

        //console.log('[done] doHide');
    };

    /**
     * Toggles all targeted checkboxes
     */
    var doToggle = function (hooks) {

        if (hooks) {
            hooks.toggle();
        }

        //console.log('[done] doToggle');
    };

    /**
     * Removes element from DOM
     * @param {Object} hooks
     */
    var doRemove = function (hooks) {

        if (hooks) {
            hooks.remove();
        }

        //console.log('[done] doRemove');
    };

    /**
     * Clears elements content
     * @param {Object} hooks
     */
    var doClear = function (hooks) {

        if (hooks) {
            hooks.empty();
        }

        //console.log('[done] doClear');
    };


    /**
     * Check all targeted checkboxes
     */
    var doCheck = function (hooks) {

        if (hooks) {
            hooks.prop('checked', true);
        }

        //console.log('[done] doCheck');
    };

    /**
     * Uncheck all targeted checkboxes
     */
    var doUncheck = function (hooks) {

        if (hooks) {
            hooks.prop('checked', false);
        }

        //console.log('[done] doUncheck');
    };

    /**
     * Focuses all targeted checkboxes
     */
    var doFocus = function (hooks) {

        if (hooks) {
            hooks.focus();
        }

        //console.log('[done] doFocus');
    };

    /**
     * Blur all targeted checkboxes
     */
    var doBlur = function (hooks) {

        if (hooks) {
            hooks.blur();
        }

        //console.log('[done] doBlur');
    };

    /**
     * Trigger specified event all targets
     * @param {Object} hooks
     * @param {CfgHooks} config 
     */
    var doTrigger = function (hooks, config) {

        if (hooks) {

            var t = _ternary(config.getActionAttrs());

            if (config.isAllowed()) {
                hooks.trigger(t.positive);
            } else {
                hooks.trigger(t.negative);
            }
        }

        //console.log('[done] doTrigger');
    };

    /**
     * Adds class to all targets
     * @param {Object} hooks
     * @param {CfgHooks} config
     */
    var doClassAdd = function (hooks, config) {

        if (hooks) {
            hooks.addClass(config.getActionAttrs());
        }

        //console.log('[done] doClassAdd');
    };

    /**
     * Removes class from all targets
     * @param {Object} hooks
     * @param {CfgHooks} config
     */
    var doClassRmw = function (hooks, config) {

        if (hooks) {
            hooks.removeClass(config.getActionAttrs());
        }

        //console.log('[done] doClassRmw');
    };

    /**
     * Toggles class on all targets
     * @param {Object} hooks
     * @param {CfgHooks} config
     */
    var doClassTgl = function (hooks, config) {

        if (hooks) {
            hooks.toggleClass(config.getActionAttrs());
        }

        //console.log('[done] doClassRmw');
    };

    /**
     * Clears all targeted inputs
     * @param {Object} hooks
     */
    var doInputClear = function (hooks) {

        if (hooks) {
            hooks.val('');
        }

        //console.log('[done] doInputClear');
    };

    /**
     * Clears all descendant inputs of all targets
     * @param {Object} hooks
     */
    var doInputClearAll = function (hooks) {

        if (hooks) {
            hooks.find('input').val('');
        }

        //console.log('[done] doInputClearAll');
    };

    /**
     * Sets value of targeted inputs
     * @param {Object} hooks
     */
    var doInputVal = function (hooks, config) {

        if (hooks) {
            hooks.val(config.getActionAttrs());
        }

        //console.log('[done] doInputVal');
    };

    /**
     * Submits all targets
     * @param {Object} hooks
     */
    var doSubmit = function (hooks) {

        if (hooks) {
            hooks.submit();
        }

        //console.log('[done] doSubmit');
    };

    /**
     * Default action callback
     * @param {Event} e
     */
    var actCallback = function (e) {

        var $node = _jq(e.currentTarget);
        var defs = _defs($node, e.type);

        if (false === defs) {
            return false;
        }

        jQuery.each(defs, function (i, had) {
            _do(e, had, $node);
        });
    };

    /**
     * Registers hooks actions triggers
     * ---
     * Each hook should have propper trigger. This trigger can be
     * any html element with specific data attribute format like below.
     * ---
     * Format: data-do="{actionName, hookName, when, condition}"
     * e.g. <span data-do="{'hide', 'overlay'}">Hide overlay</span>
     * ---
     * @param {Object} context
     * @return {Boolean}
     */
    var actInit = function (context) {

        // find all childs inside given parent
        var nodes = _nodes(context);

        if (false === nodes || !nodes.length) {
            return false;
        }

        // dettach and attach actions on all nodes
        nodes.each(function (i, node) {

            var $node = _jq(node);
            var defs = _defs($node);

            if (false === defs) {
                return;
            }

            jQuery.each(defs, function (evt) {

                //console.log('Att:', evt, actCallback);

                $node.off(evt, actCallback);
                $node.on(evt, actCallback);
            });
        });

        return true;
    };

    /**
     * Hooks initialization
     * @param {jQuery} context
     * @returns {Boolean}
     */
    var init = function (context) {
        return actInit(context || jQuery(document));
    };

    /**
     * Public interface
     */
    return {
        init: init,
    };
})();
