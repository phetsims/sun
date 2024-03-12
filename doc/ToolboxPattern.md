---
title: ToolboxPattern
category: other-ui
---

## Toolbox Design Pattern

Here’s the when and why we use a toolbox pattern.

- The toolbox pattern is a custom interaction pattern used to group 2 or more tools (e.g., measurement tools) that can be added to the Play Area of a simulation.
- The tools in the toolbox present as button interactions, and are placed in the PDOM order as single focusable objects (i.e., no grouping behavior yet available on the toolbox).
- The activated tool is visually transformed, receives focus, and becomes draggable with Arrow keys (and alternatives).

**Note: This pattern is also referred to as the Creator Pattern, (https://phetsims.github.io/scenery/examples/creator-pattern.html)[https://phetsims.github.io/scenery/examples/creator-pattern.html].**

## Aesthetic Considerations
* Toolbox appears in a visually defined space like a outlined box.
* The toolbox and tools usually appear without any visual names, but in some cases names appear in addition to the tool icons (e.g., Circuit Construction Kit: AC).
* Title case is used for text-based too names.
* An activated tool becomes full size and is placed in its larger form in a useful place in the Play Area of the simulation, or near the toolbox.


## Interaction Design Considerations
- Ensure the PDOM placement of the activated tool makes sense to the use of the activated tool.
- Ensure focus goes on the activated tool so it can be easily moved once activated.
- Ensure it is not too easy to accidentally return the tool to the tool box when using Alt Input.
- Ensure the Escape key works to return a focused-activated tool to the tool box.
- Consider if any sim-specific shortcuts make using the tool more efficient and effective for Alternative Input users.


### Keyboard Interaction & Support
| Key | Function |
| :-- | :------- |
|Tab | Moves keyboard focus to the first/next tool in the toolbox. (No grouping at this point.) |
|Shift + Tab | Moves keyboard focus to the previous tool in the toolbox (or out of the toolbox to the previous focusable item). |
|Space or Enter | Activates or grabs the focused tool. |
|Arrow keys | Move the focused-activated tool. |
|WASD keys| Work as an alterantive to the Arrow keys to move the focused-activated tool. |
|Escape | Returns the tool to the toolbox. **Note: Visual proximity may also return the focused-activated tool to the toolbox. |
**Note: Optional: Sim-specific shortcuts can be designed and implemented to jump a focused-activated tool to useful places in the simulation.**



## Toolbox Visual Example
- Geometric Optics
  Visual toolbox with no visual names:
  ![alt text "Sample toolbox for Geometric Optics"](images/go-toolbox.png "Geometric Optics, toolbox")



## Checkbox as Alternative to the Toolbox Pattern
The checkbox interaction can be used as an alternative work-around to using the toolbox pattern. If a checkbox is used:
1. The Escape will not work as a shortcut to hide the tool and uncheck the checkbox.
2. A tool activated by a checkbox does not need an additional two-step drag. Like in the case of the toolbox, the user intentionally activates the tool, and the Arrow keys (or alternatives) can be used to move the draggable tool.
3. Tools activated by a checkbox would also need to consider the need for sim-specific shortcuts.


## Description Design Considerations (Future)
- The tool activation step for both the toolbox and the checkbox tool provides the opportunity to give instructions to blind users once description is implemented. The activation step is what was determined to be needed for BASE's Yellow Balloon, Friction's Chemistry Book, and others (FL, GFLB) where these draggable objects are already in the Play Area.
- It's these "already-in-the-Play-Area" draggable sim objects that may need to be revisited once the sims that contain these readily available draggable objects get a description feature.

#### State Descriptions
```html
<h3>Toolbox</h3>
<p>Grab a ruler or marker as needed.</p>
<button>Horizontal Ruler</button>
<button>Vertical Ruler</button>
```
#### Responsive Descriptions
* When activated: Added to {{placeInPlayArea}}. Use Arrow keys or W, A, S, or D keys to move {{Horizontal Ruler}}.
* When returned: Back in toolbox.
