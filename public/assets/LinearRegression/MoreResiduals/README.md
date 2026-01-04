# More about Residuals! - Required Images

This folder contains all the images needed for the "More about Residuals!" problem module.

## Current Status

### ✅ Images Present:
- `intcategory.png` - Example of interaction plot with distinct/categorical feature X2
- `intregression.png` - Example of interaction plot with continuous feature X2

### ❌ Images Still Needed:

#### Page 8:
- `intploteg.png` - Example showing interaction detection using residual plot with color coding

#### Page 9 - Quiz Images (Jake Sully's Farm):
- `plot1.png` - Soil pH vs Nitrogen Levels (INCORRECT - should show random pattern)
- `plot2.png` - Precipitation vs Average Temp (CORRECT - should show interaction pattern)
- `plot3.png` - Seed Quantity vs Irrigation Type (INCORRECT - should show random pattern)
- `plot4.png` - Pest Density vs Sunlight Hours (INCORRECT - should show random pattern)
- `plot5.png` - Fertilizer Brand vs Planting Date (CORRECT - should show interaction pattern)

## Image Requirements:

### For Quiz Images:
- **Correct answers (plot2.png, plot5.png)**: Should show residual interaction plots where color coding creates distinct groups or follows clear patterns (not random clouds)
- **Incorrect answers (plot1.png, plot3.png, plot4.png)**: Should show residual interaction plots where color coding appears random without distinct grouping

### Recommended Dimensions:
- Width: 600-800px
- Height: 400-500px
- Format: PNG with transparent or white background
- DPI: 150-300 for crisp display

## Notes:
Once all images are added to this folder, they will automatically appear in the problem pages. The Visual.jsx component uses Next.js Image component with proper optimization.
