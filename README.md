### Small PDF engine

this is small engine to dynamically divide html templates (handlebars) into pages
that is applicable for pdf generation.


## Usage

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&family=Tajawal&display=swap"
          rel="stylesheet">
    <title>Page title</title>

    <!-- here link data -->
    <meta name="test-data" src="./data/invoice-with-details.json"/>

    <!-- here link data -->
    <link rel="stylesheet" href="../../css/settings.css"/>
    <link rel="stylesheet" href="../../css/reset.css"/>
    <link rel="stylesheet" href="../../css/labeled-info.css"/>
    <link rel="stylesheet" href="../../css/table.css"/>
    <link rel="stylesheet" href="../../css/style.css"/>
</head>
<body>

  <div id="templates">
    <!-- here add your templates -->
  </div>

  <!-- here links of scripts -->
  <script src="../../js/logger.js"></script>
  <script src="../../js/enums.js"></script>
  <script src="../../js/template.js"></script>
  <script src="../../js/main.js"></script>
</body>
</html>
```


#### template types

templates are recognized by data-template attribute which will have one of the following values
1. FIXED
2. VARIABLE
3. LANDSCAPE_VARIABLE 


1. __FIXED:__
content will not be divided at all
```html
<section data-template="FIXED" class="section">
    <hr class="separator separator--accent">
    <!-- rest of templates -->
</section>
```


2. __VARIABLE:__
   Portrait template and table will be divided into pages

```html
<section data-template="VARIABLE" class="section">
    <hr class="separator separator--accent">

    <table class="table table--first-cell" data-template-element="CONTAINER">
        <thead data-template-element="HEADER">
        <!-- rest of header -->
        </thead>


        <tbody data-template-element="BODY">

        <tr data-template-element="ROW"></tr>
        <tr data-template-element="ROW"></tr>
        <tr data-template-element="ROW"></tr>
        <tr data-template-element="ROW"></tr>
        <!-- NOTE: ALL elements will be divided must have ROW in data-template-element attribute -->
        </tbody>
    </table>
    <!-- rest of templates -->
</section>
```


2. __LANDSCAPE_VARIABLE:__
   Landscape template and table will be divided into pages

```html
<section data-template="LANDSCAPE_VARIABLE" class="section">
    <hr class="separator separator--accent">

    <table class="table" data-template-element="CONTAINER">
        <thead data-template-element="HEADER">
        <!-- rest of header -->
        </thead>


        <tbody data-template-element="BODY">
           <tr data-template-element="ROW"></tr>
           <tr data-template-element="ROW"></tr>
           <tr data-template-element="ROW"></tr>
           <tr data-template-element="ROW"></tr>
           <!-- NOTE: ALL elements will be divided must have ROW in data-template-element attribute -->
        </tbody>
    </table>
    <!-- rest of templates -->
</section>
```
