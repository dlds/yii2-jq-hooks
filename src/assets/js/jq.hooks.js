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
 * Hook action definition (data-had) format: {
 *      'jqEevent' => [
 *          ['hookActionName' 'hookName', 'hookActionCondition', 'hookActionParams],
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
var Hooks = function () {

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
            node = $(node);
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
            context = $(document);
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
     * @param String name given hookName
     * @return Object
     */
    var _hooks = function (name, node) {

        // cancel if name does not exist
        if (name === undefined) {
            return node;
        }

        // cache hooks if they are not yet
        if (!cache.hooks.hasOwnProperty(name) || null === cache.hooks[name]) {
            cache.hooks[name] = $('[data-hook="' + name + '"]');
        }

        // try css selector if no data-hook is found
        if (!cache.hooks[name].length) {
            cache.hooks[name] = $(name);
        }

        // debug hooks
        //console.log(cache.hooks[name]);

        // retrieves cached hooks
        return cache.hooks[name];
    };

    /**
     * Run action based on hook action definition
     * @param {Event} e
     * @param {Array} had
     * @param {jQuery} node
     * @returns {boolean}
     */
    var _do = function (e, had, node) {

        e.preventDefault();

        // get action fn name
        var fn = _fn(had, node)

        if (false === fn) {
            return false;
        }

        var hooks = _hooks(hadHook(had), node);

        // run action
        switch (fn) {
            case 'open':
                return doOpen(hooks);
            case 'close':
                return doClose(hooks);
            case 'toggle':
                return doToggle(hooks);
            case 'show':
                return doShow(hooks);
            case 'hide':
                return doHide(hooks);
            case 'check':
                return doCheck(hooks);
            case 'uncheck':
                return doUncheck(hooks);
            case 'focus':
                return doFocus(hooks);
            case 'blur':
                return doBlur(hooks);
            case 'class-add':
                return doClassAdd(hooks, hadParams(had));
            case 'class-rmw':
                return doClassRmw(hooks, hadParams(had));
            case 'trigger':
                return doTrigger(hooks, hadParams(had), _cnd(hadCond(had), node));
        }
    };

    /**
     * Condition definition process
     * ---
     * Retrieves result of condition definition
     * ---
     * @param Array had
     * @param {Object} node
     * @returns {boolean}
     */
    var _cnd = function (df, node) {

        if (false === df || true === df) {
            return df;
        }

        var fn = new Function(df);
        return fn.apply(_jq(node));
    }

    /**
     * Indicates if action is doable
     * ---
     * Runs and retrieve result of 'hookActionCondition'
     * ---
     * @param Array had
     * @param {Object} node
     * @returns {boolean}
     */
    var _doable = function (had, node) {

        return _cnd(hadCond(had), node);
    };

    /**
     * Retrieves action function name
     * @param {Array} had
     * @param {String|jQuery} node
     * @returns {String}
     */
    var _fn = function (had, node) {

        var ternary = _ternary(hadName(had));

        if (!_doable(had, node)) {
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

        if (!$.isArray(names)) {
            opts.positive = df;
            return opts;
        }

        opts.positive = names[0] || false;
        opts.negative = names[1] || false;

        return opts;
    }

    /**
     * Checks if given action definition is valid
     * @param {Array} had
     * @returns {boolean}
     */
    var isHad = function (had) {
        return $.isArray(had) && (had.length >= 1 && had.length <= 4);
    }

    /**
     * Retrieves action name
     * @param {Array} had
     * @returns {String|Boolean}
     */
    var hadName = function (had) {
        // check if is valid definition
        if (!isHad(had)) {
            return false;
        }

        return had[0];
    };

    /**
     * Retrieves action hook
     * @param {Array} had
     * @returns {String|Boolean}
     */
    var hadHook = function (had) {
        // check if is valid definition
        if (!isHad(had)) {
            return false;
        }

        return had[1];
    };

    /**
     * Retrieves action condition
     * @param {Array} had
     * @returns {String|Boolean}
     */
    var hadCond = function (had) {
        // check if is valid definition
        if (!isHad(had)) {
            return false;
        }

        return had[2] || true;
    };

    /**
     * Retrieves action params
     * @param {Array} had
     * @returns {String|Boolean}
     */
    var hadParams = function (had) {
        // check if is valid definition
        if (!isHad(had)) {
            return false;
        }

        return had[3] || true;
    };

    /**
     * Open all targeted elements
     */
    var doOpen = function (hooks) {

        if (hooks) {
            hooks.addClass('open');
        }

        //console.log('[done] doOpen');
    };

    /**
     * Close all targeted elements
     */
    var doClose = function (hooks) {

        if (hooks) {
            hooks.removeClass('open');
        }

        //console.log('[done] doClose');
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
     */
    var doTrigger = function (hooks, params, condition) {

        if (hooks) {

            var t = _ternary(params);

            if (condition) {
                hooks.trigger(t.positive);
            } else {
                hooks.trigger(t.negative);
            }
        }

        //console.log('[done] doTrigger');
    };

    /**
     * Adds class to all targets
     */
    var doClassAdd = function (hooks, params) {

        if (hooks) {
            hooks.addClass(params);
        }

        //console.log('[done] doClassAdd');
    };

    /**
     * Removes class from all targets
     */
    var doClassRmw = function (hooks, params) {

        if (hooks) {
            hooks.removeClass(params);
        }

        //console.log('[done] doClassRmw');
    };

    /**
     * Default action callback
     * @param {Event} e
     */
    var actCallback = function (e) {

        var $node = $(e.currentTarget);
        var defs = _defs($node, e.type);

        if (false === defs) {
            return false;
        }

        $.each(defs, function (i, had) {
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

            $.each(defs, function (evt) {

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
        return actInit(context || $(document));
    };

    /**
     * Public interface
     */
    return {
        init: init,
    };
}();
