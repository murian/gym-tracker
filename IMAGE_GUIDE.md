# How to Add Exercise Images

The app now supports exercise images! Here's how to add them:

## Step 1: Prepare Your Images

You have 5 exercise images to add. Save them with these exact names:

1. **dumbbell-press.jpg** - Image 1 (Barbell bench press)
2. **inclined-dumbbell-press.jpg** - Image 2 (Inclined dumbbell press)
3. **lateral-raises.jpg** - Image 3 (Lateral raises)
4. **overhead-press.jpg** - Image 4 (Overhead press)
5. **triceps-dips.jpg** - Image 5 (Triceps dips)

## Step 2: Place Images in the Correct Folder

1. Navigate to: `C:\Dev\gym-tracker\public\images\exercises\`
2. Copy all 5 images into this folder
3. Make sure the filenames match exactly (case-sensitive)

## Step 3: Clear Browser Data (If Needed)

If you already have exercises saved, you'll need to refresh them to see the images:

1. Open the app in your browser
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Type: `localStorage.clear()` and press Enter
5. Refresh the page (`F5`)

The app will reload with the new default exercises including images!

## How Images Appear

### In Free Workout Tracker:
- Each exercise card will show a small thumbnail image (96x96 pixels) on the left
- The image helps you quickly identify the exercise

### In Exercise Manager:
- When adding/editing exercises, you can enter an image URL
- A preview will appear below the input field
- Example URL: `/images/exercises/dumbbell-press.jpg`

## Adding Custom Exercise Images

### Option 1: Using Local Images
1. Save your image in `public/images/exercises/`
2. In Exercise Manager, use the format: `/images/exercises/your-image-name.jpg`

### Option 2: Using External URLs
1. Upload image to an image hosting service (Imgur, etc.)
2. In Exercise Manager, paste the full URL: `https://example.com/image.jpg`

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 500x500 pixels minimum
- **Orientation**: Square images work best
- **File size**: Keep under 200KB for fast loading

## Troubleshooting

### Images not showing?
- Check the file path is correct
- Verify images are in `public/images/exercises/`
- Check browser console (F12) for errors
- Clear localStorage and refresh

### Images look stretched?
- Use square images (same width and height)
- The app automatically crops to fit

## Your 5 Images Mapping

Based on the images you provided:

```
Image 1 (Barbell bench press) → dumbbell-press.jpg
Image 2 (Inclined dumbbell press) → inclined-dumbbell-press.jpg
Image 3 (Lateral raises) → lateral-raises.jpg
Image 4 (Overhead press) → overhead-press.jpg
Image 5 (Triceps dips) → triceps-dips.jpg
```

Rename your images accordingly and place them in the `public/images/exercises/` folder!
