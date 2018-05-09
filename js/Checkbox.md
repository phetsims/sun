# [Checkbox](Checkbox.js)

Used in the following simulations:

Images from usage (linked to sims)

[Options](Checkbox.js#L39-L69)

* A11y role: checkbox
* Design Pattern: Spacebar

## Checkbox with visual label/string
```html
<input id=”energy-symbols” type=”checkbox” notchecked>
<label for=”energy-symbols”>Energy Symbols</label>
```
![alt text](../docs/images/checkbox-energy-symbols.png "Energy Symbols Checkbox")

| Primary Element        | Label | Help Text/Content |
| ------------- |:-------------:| -----:|
| Checkbox | Energy Symbols, checkbox (checked, unchecked) | Observe energy chunks move and change through system |

## Checkbox without visual label/string (option with aria-label)

```html
<input id=“counting-numbers” type=“checkbox” aria-label=“Counting numbers” notchecked>
```

![alt text](../docs/images/checkbox-123.png "Numeric Checkbox")

| Primary Element        | Label | Help Text |
| ------------- |:-------------:| -----:|
| Checkbox | Counting numbers, checkbox (checked, unchecked) | Count each unit of area  |