<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>School Admin</title>
    <script>
        window.__AUTH__ = {{ session('logged_in') ? 'true' : 'false' }};
    </script>
    @viteReactRefresh
    @vite('resources/js/main.jsx')
</head>
<body>
    <div id="app"></div>
</body>
</html>
