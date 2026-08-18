<?php
declare(strict_types=1);

// 1. Define the scanning directory (where your .jsol files live) BEFORE any HTML output
$runDir = __DIR__; // Busca archivos .jsol estrictamente en su propio directorio

// 2. Boot the engine (this handles asset routing and must run before headers are sent)
require __DIR__ . '/engine/boot.php';

/**
 * JSOL REPL - Embedding Example
 * This file demonstrates how to embed the JSOL REPL seamlessly inside any host application.
 * The REPL container automatically fills 100% of its parent's dimensions.
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSOL REPL - Embedded Example</title>

    <!-- 3. Include the REPL isolated CSS -->
    <?php require __DIR__ . '/engine/head.php'; ?>
    
    <style>
        /* Host App Styling: You control the size and placement of the wrapper */
        body { font-family: sans-serif; background: #e9ecef; padding: 2rem; }
        
        .my-custom-wrapper {
            width: 100%;
            max-width: 900px;
            height: 600px; /* The REPL fills this height natively */
            margin: 0 auto;
            border: 1px solid #ccc;
            border-radius: 8px;
            overflow: hidden; /* Clips the REPL's internal corners */
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>

    <h1 style="text-align: center;">Host Application</h1>
    <p style="text-align: center;">
        The REPL is constrained below inside a 600px height div.<br><br>
        Theme: <a href="#" data-host-action="set-theme" data-theme-val="dark">[dark]</a> | <a href="#" data-host-action="set-theme" data-theme-val="light">[light]</a>
    </p>

    <!-- 4. Create the wrapper, assign the base class, and select a theme (light/dark) -->
    <div class="my-custom-wrapper jsol-repl-container" data-theme="light">
        <?php 
            // 5. Render the UI
            require __DIR__ . '/engine/ui.php'; 
        ?>
    </div>

    <script>
        // 6. Simple host script to toggle the REPL theme
        document.querySelectorAll('[data-host-action="set-theme"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const theme = e.target.getAttribute('data-theme-val');
                const wrapper = document.querySelector('.my-custom-wrapper');
                if (wrapper) {
                    wrapper.setAttribute('data-theme', theme);
                }
            });
        });
    </script>
	
</body>
</html>