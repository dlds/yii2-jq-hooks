# jQuery action hooks

Action hooks is simple jQuery helper library. Used when jQuery operation like show, hide, toggle, ... are required to attach with conditional ability.

## Installation

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```bash
$ composer require dlds/yii2-jqhooks
```

or add

```
"dlds/yii2-jqhooks": "~1.0"
```

to the `require` section of your `composer.json` file.

## Usage

You want to show 'overlay' html element when user clicks on 'trigger' html element. With Action hooks you have to do:

1. Register hook

  ```html
  <div class="my-custom-overlay-class" data-hook="overlay"></div>
  ```

2. Register trigger

  ```html
  <a class="my-custom-trigger-class" data-had="{"click":[["show","overlay"]]}"></div>
  ```

> Each registered hook must have **data-hook="{hookName}"** attribute. Each trigger element must have **data-had="{hookActionDefinition}"** attribute

## Format

Hook action definition (data-had) format:

```javascript
{
  'jqEevent' => [
    ['hookActionName' 'hookName', 'hookActionCondition'],
  ]
}
```

## Attributes

1. `jqEvent` is classic jQuery event like 'change', 'click', ...
2. `hookActionName` is jqhooks aciton method name (doClose, doOpen, doToggle, ...).
3. `hookName` is custom string which reflects value of 'data-hook' attr assigned to target element
4. `hookActionCondition` callback or simple fn definition which will be processed as js function. This condition allows you to define when the action will be processed.

## Actions

1. `doOpen` add class 'open' to hooked element
2. `doClose` remove class 'open' to hooked element
3. `doShow` shows hooked element (calls $.show())
4. `doHide` hides hooked element (calls $.hide())
5. `doToggle` toggles hooked element (calls $.toggle())
6. `doCheck` adds property 'checked=true' to hooked element
7. `doUncheck` rmeoves property 'checked=true' to hooked element

## Ternary usage

You can specify ternary condition like following:

```javascript
{
  'click' => [
      ['show:hide' 'overlay', 'return this.val() === 1'],
  ]
}
```

This definitios runs 'show' action if clicked element value === 1 otherwise it runs 'hide' action.

## Helper

You can simple use `JqHooks::attach()` which registeres proper js and runs initialization on document ready.

```php
JqHooks::attach([
  'click' => [
      ['show:hide' 'overlay', 'return this.val() === 1'],
  ]
])
```
