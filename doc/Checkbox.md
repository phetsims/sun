
## General Design Considerations

Here’s the when and why we use visual checkbox interaction in simulation design.
* Checkboxes that appear as a traditional user interface component (square box with that can be checked or empty) are typically used for secondary or non-essential interactions in PhET simulations.
* Used to turn an option on or off.
* Used to select more than one option in a group of option.\
* other general considerations???


## Aesthetic Considerations
* Checkbox appears visually with a text-based label or an icon as the label, or combination of both text and an icon.
* other aesthetic considerations???


## Accessibility Considerations
The first rule of ARIA is to use a native HTML element whenever possible. We do indeed use native checkbox elements in the PDOM to represent checkbox interactions. Thus, some of the guidance provided in ARIA Practices is not relevant.
* Checkboxes with clear seperation between the actual box and the label are generally represented in the PDOM as an `input` and a `label`.
* Groups of related checkboxes may benefit from be semantically grouped using a containing element (e.g., `fieldset` or `div`).
* Semantically grouped checkboxes may benefit from a group name (e.g. `h3` or `legend`)


### Gesture Support
ToDO.

### Keyboard Support
| Key | Function |
| :-- | :------- |
|Tab | Moves keyboard focus to the checkbox. |
|Space | Toggles checkbox between checked and unchecked states. |


### Management of Role, Property, State, and Tabindex Attributes

| Role | Attribute | Element | Usage |
|:-----|:----------|:------- |:------|
|:-----|:----------|:------- |:------|
|:-----|:----------|:------- |:------|
|:-----|:----------|:------- |:------|
|:-----|:----------|:------- |:------|

### Simplified HTML Examples for PDOM
#### (Suggested) Options for Checkbox in the A11y API
When creatig the common code component, it would be useful to either use an `input` or an `aria-label` to provide the accessible name. With real inputs, I do not see a need to ever need to use `aria-labelledyby`.

#### Checkbox with visual label text
##### Energy Forms and Changes?
Visual checkbox with a text-based label:
![alt text "Sample unchecked checkbox for Engery Symbols"](images/efac-checkbox-energy-symbols.png "Energy Symbols, checkbox checked")

```html
<input id=”energy-symbols” type=”checkbox” notchecked>
<label for=”energy-symbols”>Energy Symbols</label>
<p>Observe energy chunks move and change through system.</p>
```

#### Checkbox without visual label text (option with aria-label)
##### Area Model Introduction
Visual checkbox with unhelpful label
![alt text "Sample check"](images/ami-checkbox-123.png "Numeric Checkbox")

```html
<input id="counting-numbers" type="checkbox" aria-label="Counting numbers" notchecked>
<p>Use area grid with or without counting numbers in grid cells.</p>
```


| Primary Element        | Label | Help Text |
| ------------- |:-------------:| -----:|
| Checkbox | Counting numbers, checkbox (checked, unchecked) | Count each unit of area  |### Supporting Accessibility 

### Supporting Accessibility Resources
* [Using ARIA, working draft](https://www.w3.org/TR/using-aria/)
* [HTML5.1, Section 4.10.5.1.15. Checkbox state](type=checkbox)https://www.w3.org/TR/html51/sec-forms.html#checkbox-state-typecheckbox
* [ARIA Practices 1.1 Section 3.6 Checkbox](https://www.w3.org/TR/wai-aria-practices/)

### Design Doc Content Template Text
**Interaction Name**

https://www.w3.org/TR/using-aria/