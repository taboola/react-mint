# React Mint &middot; [![GitHub license](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![npm version](https://img.shields.io/npm/v/react-mint.svg?style=flat)](https://www.npmjs.com/package/react-mint)

react-mint is a tooltip library built utilizing React-specific features like portals and context to provide a rich set of features for large applications.

## Usage

Install react-mint via npm.

    npm install react-mint --save

Keep in mind react-mint has React v16.3 and React DOM v16 as a peer dependency, so your app needs to meet these requirements to use react-mint

Render a TooltipPortal where you want your tooltips to exist in the DOM. This is typically at the top of your app to ensure your tooltips never have to fight other components
for a higher z-index.

```jsx
import { TooltipPortal } from 'react-mint';
import { render } from 'react-dom';

render(
  <TooltipPortal>
    <App />
  </TooltipPortal>,
  document.querySelector('#root')
);
```

Wherever you want to render a tooltip in your app, render a Tooltip component with the contents of the tooltip as the children of the component

```jsx
import { Tooltip } from 'react-mint';
import React from 'react';

// renders a blue box which will display a tooltip that says Hello! when hovered over
const App = () => (
  <div style={{background: 'blue', width: 200, height: 200}}>
    <Tooltip>
      Hello!
    </Tooltip>
  </div>
)
```

## Documentation

### `<Tooltip>`

**position** : top | right | left | bottom (default: top)

The direction the tooltip renders. The enums used mirror the ones used for css position.

**duration** : int (default : 300)

The total duration of the mounting/unmounting animation. If you want to use an animation with varying durations, use the longest time here.

**delay** : int | array([int, int]) (default : 0)

The delay for the tooltip to show/hide. If just an int is provided, this value will be the show delay only. If a tuple is provided, the first int is the show delay and the second is the hide delay.

**hoverable** : bool (default: true)

Controls whether or not hovering over the parent is what triggers the mounting/unmounting of the tooltip

**clickable** : bool (default: false)

Controls whether or not clicking the parent is what triggers the mounting/unmounting of the tooltip

**showing** : bool (default: undefined)

Controls whether or not the tooltip is mounted. This is useful for providing custom logic to trigger tooltips instead of the built in functionality. Typically you will want to disable hoverable and clickable when using this feature, although this boolean has priority over both of them.

**interactive** : bool (default: false)

Controls whether or not the tooltip can be interacted with using the mouse. When set to true, moving the mouse over the tooltip will cause it to remain open so that the user can further interact with it (e.g. clicking buttons inside the tooltip)

**tailHeight** : int (default: 6)

The height of the tooltip's tail in pixels. A tail height of 0 will hide the tail

**offset** : int (default : 6)

The vertical spacing between the tooltip tail and the parent element it points to in pixels

**offsetBody** : int (default : 0)

The horizontal offset that shifts the tooltip tail away from the centered state on the body

**pure** : boolean (default : true)

When true, a shallow comparison check is done on the props passed in and if a difference is detected, will cause the component to recompute its position and size. Otherwise, it will do this computation every rerender. This defaults to true because the computation for position and size are expensive and should be minimized, therefore disabling this flag should be used with caution. If you need a state change to resize or reposition a rendered tooltip, simply passing in that property as a prop will accomplish that.

**autoFlip** : boolean (default : true)

Turns on the functionality which causes the tooltip to automatically flip positions (top <-> bottom, left <-> right) when the tooltip hits the edge of the nearest Portal. Typically there will be only one portal which encompasses the entire viewport, so this prop will cause flipping when the tooltip would normally to bleed off the document.

**inline** : boolean (default : false)

Controls whether or not the tooltip is rendered at the current location in the DOM. Use this flag if for whatever reason you do not wish to use portals or something constrains you to render the tooltip in the DOM at the same location in the React DOM. Please note, the tooltips utilize absolute positioning so if you use inline, the DOM element wrapping the tooltip should have absolute or relative positioning
in order to 'capture' the tooltip. This will automatically become true if the tooltip has no ancestor TooltipPortal and an explicit portalId is not given

**style** : object

The inline style applied to the entire tooltip. You should put styles that need to affect both the box and the tail of the tooltip here, such as backgroundColor and border. Keep in mind if you provide your own style all the defaults will be overwritten.

**boxStyle** : object

The css inline applied to only the box of the tooltip. Styles such as borderRadius, padding, and color should be applied here. Keep in mind if you provide your own style all the defaults will be overwritten.

**tailStyle** : object

The inline style applied to only the tail of the tooltip. You typically should not need to apply a style here, but the option is available for the few use cases. Keep in mind if you provide your own style all the defaults will be overwritten.

**getTransitionStyle** : func(entering : bool, duration : int, position: string)

The function that gets called when the tooltip is mounting or unmounting. This function takes 3 parameters: entering, duration, and position, which you should use to return the proper style for the tooltip. When entering is false, the object should be the initial style or ending style. When entering is true, the object should be the style when the tooltip is in neutral. Refer to the examples for more tips on how to use this.

**Default Styles**
```jsx
<Tooltip
  style={{
    background: '#282828',
  }}
  boxStyle={{
    borderRadius: 4,
    padding: 8,
    color: '#fff',
  }}
  tailStyle={undefined}
  getTransitionStyle={(entering) => ({
    opacity: entering ? 1 : 0,
    transitionProperty: 'opacity'
  })}
>
  {children}
</Tooltip>
```

**boxClassName** : string

Class name that gets applied to the box div. If the style is not applying properly, try
also applying the style to maskClassName. Styles applied to the box are normally
programatically computed based on passed in styles, so certain styles like background
color may require some trial and error

**maskClassName** : string

Class name that gets applied to a mask that gets rendered. Certain styles like background
color and border radius should be applied additionally on this class, but sizing styles like
padding should not be applied

**tailClassName** : string

Class name that gets applied to the tail. Typically you just change colors here

**theme** : string (default: undefined)

The theme that will get applied to the tooltip from the nearest TooltipPortal. Read the TooltipPortal props for more information on theming

**portalId** : string (default: null)

The element ID of the DOM element you want your tooltip to be rendered at. If using a TooltipPortal, this will be automatically generated for you, otherwise you will need a DOM element as an ancestor to this tooltip with an ID matching portalId. If there is no TooltipPortal and this prop
is not provided then the tooltip will switch to inline mode

**scrollRef** : React ref (default: undefined)

The ref of the innermost DOM element that will be scrollable. The tooltip naturally hooks onto this element, but in the event that it hooks onto the wrong element due to stray css properties on earlier
elements, you can manually pass in the ref as a workaround. This information is necessary to allow the tooltip to follow along when scrolling and to prevent duplication issues

**scrollRefs** : React ref (default: undefined)
An array of scrollRefs, each element in the array will be hooked onto

**sourceRef** : React ref (default: undefined)

The ref of the component you want the tooltip to treat as its 'parent'. Typically you should not use this, as it has niche uses and makes the code hard to understand, but it exists if you need the functionality

**listenToAllParentScrolls** : boolean (default: false)

Set this to true to make the tooltip hook onto all scrollable DOM parents. Normally not useful, but can be helpful when dealing with tooltips that
exist inside multiple scrollable areas

### `<TooltipPortal>`

TooltipPortals provide two main functionalities: the React portal which all descendant Tooltip components will anchor to and a React provider which will provide themes to descendant Tooltip components. If a tooltip has no ancestor TooltipPortal and a specific portalId is not provided, the tooltip
will default to inline

**style** : object

The style object passed into the enclosing div if you need to pass it styles

**className** : string

The class name passed into the enclosing div if you need to style/select it

**themes** : object

A map of keys to objects which represent all the props in a theme. For example, a themes object of
```js
{
  default: {
    style: {
      background: 'grey',
    },
  },
  night: {
    duration: 200,
    style: {
      background: 'white',
    }
  }
}
```

means that if a descendant tooltip component has the theme prop set to 'night', it will have the duration and style prop set to the appropriate values.

**defaultTheme** : string (default: undefined)

The theme that all Tooltip descendants will use if no theme prop is explicitly provided.

**portal** : boolean (default: true)

Controls whether or not the Portal actually functions as a portal. Set to false if you for whatever reason just need to inject some special themeing without actually setting a new portal location.


## Examples

Tooltip that enters by fading in and spinning upwards.

```jsx
import { Tooltip } from 'react-mint';
import React from 'react';

const App = () => (
  <div style={{background: 'blue', width: 200, height: 200}}>
    <Tooltip
      duration={1000}
      delay={200}
      getTransitionStyle={(entering) => ({
        transitionProperty: 'transform, opacity',
        transform: `translateY(${entering ? 0 : 20}px) rotate(${entering ? 0 : 360}deg)`,
        opacity: entering ? 1 : 0,
      })}
    >
      Hello!
    </Tooltip>
  </div>
)
```

Light tooltip theme with box shadow.

```jsx
import { TooltipPortal } from 'react-mint';
import { render } from 'react-dom';

export const tooltipThemes = {
  light: {
    style: { background: '#fff' },
    boxStyle: { 
      borderRadius: 4,
      padding: '8px',
      color: '#3a4047',
      boxShadow: '3px 3px 8px 0 rgba(0,0,0,0.25)',
    },
    tailStyle: {
      boxShadow: '3px 0px 8px 0 rgba(0,0,0,0.25)',
    },
  }
}

render(
  <TooltipPortal
    themes={tooltipThemes}
    defaultTheme={'light'}
  >
    <App />
  </TooltipPortal>,
  document.querySelector('#root')
);
```

### License

React Mint is [Apache v2 licensed](./LICENSE).