<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
	<meta name="viewport" content="width=device-width, initial-scale=1">

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
