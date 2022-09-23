# Elevations
z2 - Normal card
z3
z4
z5 - Toolbar
z9
z15

# Main content divs
If not in a mat-sidenav-container, add the mat-app-background class

# Typography
<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">


  display-4, display-3, display-2 and display-1 - Large, one-off headers, usually at the top of the page (e.g. a hero header).
  headline - Section heading corresponding to the <h1> tag.
  title - Section heading corresponding to the <h2> tag.
  subheading-2 - Section heading corresponding to the <h3> tag.
  subheading-1 - Section heading corresponding to the <h4> tag.
  body-1 - Base body text.
  body-2 - Bolder body text.
  caption - Smaller body and hint text.
  button - Buttons and anchors.

# Metrics
Units of 8 px, except app toolbar iconography where 4ps is allowed
App toolbar dense for desktop: 48px;
App toolbar dense:
  - 24px to first icon (icon itself, not container), also right padding to firt icon on the right
  - 80 px to first content
  - 40 px icon container heights (visible when hovered)

Font sizes:
Ratios 16:9  3:2  4:3  1:1  3:4  2:3

# theme$mat-light-blue: (
  50: #e1f5fe,
  100: #b3e5fc,
  200: #81d4fa,
  300: #4fc3f7,
  400: #29b6f6,
  500: #03a9f4,
  600: #039be5,
  700: #0288d1,
  800: #0277bd,
  900: #01579b,
  A100: #80d8ff,
  A200: #40c4ff,
  A400: #00b0ff,
  A700: #0091ea,
  contrast: (
    50: $black-87-opacity,
    100: $black-87-opacity,
    200: $black-87-opacity,
    300: $black-87-opacity,
    400: $black-87-opacity,
    500: white,
    600: white,
    700: white,
    800: white,
    900: $white-87-opacity,
    A100: $black-87-opacity,
    A200: $black-87-opacity,
    A400: $black-87-opacity,
    A700: white,
  )
);


https://medium.com/covalent-ui/angular-material-2-theme-tutorial-2f7e6c344006
https://blog.thoughtram.io/angular/2017/05/23/custom-themes-with-angular-material.html
