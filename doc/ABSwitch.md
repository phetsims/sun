---
title: ABSwitchPattern
category: other-ui
---

## AB-Switch Design Pattern

Here’s the when and why we use an AB-Switch pattern.

- The AB-Switch pattern is a customized toggle interaction pattern used to present 2 options that are not On and Off.
- The two options generally switch between two exploration modes.

## Aesthetic Considerations
* AB-Switch appears as toggle switch with unique names or icons on each side.
* Title case is used for text-based names.

## Interaction Design Considerations for Alternative Input
* The appropriate role for the AB-Switch is a simple "button" which provides native access to the Space and Enter keys for toggling the visual state of the switch.
* Avoid toggle button and switch roles as these roles provide automatic state semantics when using screen reader software. Automatically provided states like "pressed", "not-pressed", "on", or "off" are not desired with the AB-Switch naming pattern.

### Keyboard Interaction & Support
| Key | Function |
| :-- | :------- |
|Space or Enter | Toggles the position of the switch.|


## Visual Example
- Models of a Hydrogen Atom
- Number Pairs
- ToDo: Add example screen shots

## Description Design Considerations 
- The AB-Switch pattern uses a dynamic name to communicate both its current state (A or B) and the option to switch to the other state (A or B), and the name includes teh word "Switch." 
- The names of each state should be very brief as both names will be included.
- Naming Template: 
    - {Name for A}, Switch to {Name for B}
	- {Name for B}, Switch to {Name for A}

#### State Descriptions
```html
<button>A, Switch to B</button>
<button>B, Switch to A</button>
```
#### Responsive Descriptions
* When activated: A context response would describe the necessary visual change to the representation.
