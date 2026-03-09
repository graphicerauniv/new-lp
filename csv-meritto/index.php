<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(0);
ob_implicit_flush(true);

/* ---------------- CONFIG ---------------- */
$BASE_DIR    = __DIR__;
$UPLOAD_DIR  = $BASE_DIR . "/uploads/";
$MAP_DIR     = $BASE_DIR . "/mappings/";
$MAP_FILE    = $MAP_DIR . "/last_mapping.json";

foreach ([$UPLOAD_DIR, $MAP_DIR] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0755, true);
}

$API_URL = "https://api.nopaperforms.io/lead/v1/createOrUpdate";
$SECRET_KEY = "45c20f12941b42a1a662b7f1613e8db6";
$ACCESS_KEY = "dccc277169bf4df39112e1423bab6454";

$MERITTO_FIELDS = [
    "name","mobile","email","lead_stage","sub_stage","search_criteria",
    "course","campus","specialization","source",
    "mobile_verification_status","email_verification_status",
    "country_dial_code","state","city","medium","campaign"
];

$HEADERS = [
    "Content-Type: application/json",
    "secret-key: $SECRET_KEY",
    "access-key: $ACCESS_KEY"
];

/* ---------------- HELPERS ---------------- */
function normalizeBool($v) {
    return in_array(strtolower(trim($v)), ["1","true","yes","y"], true);
}

function generateNameFromEmail($email) {
    $n = explode("@", $email)[0];
    $n = preg_replace("/[._]+/", " ", $n);
    return ucwords(trim($n));
}

function callMeritto($payload, $headers, $url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 30
    ]);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$status, $resp];
}

function saveMapping($mapping, $file) {
    file_put_contents($file, json_encode($mapping, JSON_PRETTY_PRINT));
}

function loadMapping($file) {
    return file_exists($file)
        ? json_decode(file_get_contents($file), true)
        : [];
}
?>

<!DOCTYPE html>
<html>
<head>
<title>CSV → Meritto</title>
<style>
body { font-family: Arial; padding: 20px; }
table { border-collapse: collapse; margin-top: 15px; }
th, td { border: 1px solid #ccc; padding: 6px 10px; }
select { width: 240px; }
.progress-container { width:100%; background:#eee; border-radius:6px; margin:15px 0; }
.progress-bar { height:22px; width:0%; background:#4caf50; color:#fff; text-align:center; border-radius:6px; }
.log { background:#f7f7f7; border:1px solid #ccc; height:320px; overflow:auto; padding:10px; font-family:monospace; }
.ok { color:green; }
.err { color:red; }
</style>
</head>
<body>

<h2>📤 CSV Upload → Meritto</h2>

<?php
/* ================= STEP 1: UPLOAD CSV ================= */
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["csv_file"]) && !isset($_POST["map"])) {

    $tmp = $_FILES["csv_file"]["tmp_name"];
    $filename = uniqid("csv_") . ".csv";
    $savedPath = $UPLOAD_DIR . $filename;
    move_uploaded_file($tmp, $savedPath);

    $handle = fopen($savedPath, "r");
    $headers = fgetcsv($handle, 0, ",", '"', "\\");
    fclose($handle);

    $savedMapping = loadMapping($MAP_FILE);

    echo "<h3>🧩 Step 2: Map Fields</h3>";
    echo "<form method='POST'>";
    echo "<input type='hidden' name='csv_path' value='$savedPath'>";

    echo "<table><tr><th>Meritto Field</th><th>CSV Column</th></tr>";
    foreach ($MERITTO_FIELDS as $field) {
        echo "<tr><td>$field</td><td><select name='map[$field]' required>";
        echo "<option value=''>-- Select --</option>";
        foreach ($headers as $i => $h) {
            $selected = (isset($savedMapping[$field]) && $savedMapping[$field] == $i) ? "selected" : "";
            echo "<option value='$i' $selected>$h</option>";
        }
        echo "</select></td></tr>";
    }
    echo "</table><br>";

    echo "<label>
            <input type='checkbox' name='save_mapping' value='1' checked>
            Save this mapping for future uploads
          </label><br><br>";

    echo "<button type='submit' name='push' value='1'>🚀 Push to Meritto</button>";
    echo "</form>";
    exit;
}

/* ================= STEP 2: PUSH ================= */
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["map"], $_POST["csv_path"])) {

    $mapping = $_POST["map"];

    if (isset($_POST["save_mapping"])) {
        saveMapping($mapping, $MAP_FILE);
    }

    $file = $_POST["csv_path"];
    $handle = fopen($file, "r");
    fgetcsv($handle, 0, ",", '"', "\\");

    $rows = [];
    while (($row = fgetcsv($handle, 0, ",", '"', "\\")) !== false) {
        $rows[] = $row;
    }
    fclose($handle);

    $total = count($rows);

    echo "<h3>🚀 Upload Started</h3>";
    echo "<div class='progress-container'><div class='progress-bar' id='bar'>0%</div></div>";
    echo "<div class='log' id='log'>Total Leads: <b>$total</b><br><br>";

    $i = 0;
    foreach ($rows as $row) {
        $i++;

        foreach ($mapping as $field => $index) {
            $payload[$field] = trim($row[$index] ?? "");
        }

        if (empty($payload["name"])) {
            $payload["name"] = generateNameFromEmail($payload["email"]);
        }

        $payload["mobile_verification_status"] = normalizeBool($payload["mobile_verification_status"]);
        $payload["email_verification_status"]  = normalizeBool($payload["email_verification_status"]);

        [$status, $resp] = callMeritto($payload, $HEADERS, $API_URL);
        $percent = round(($i / $total) * 100);

        echo "[$i / $total] {$payload['email']} → ";
        if ($status == 200) {
            echo "<span class='ok'>SUCCESS</span>";
        } else {
            $json = json_decode($resp, true);
            $msg = $json ? json_encode($json, JSON_PRETTY_PRINT) : $resp;
            echo "<span class='err'>FAILED ($status)</span><br>";
            echo "<span class='err'>→ " . nl2br(htmlspecialchars($msg)) . "</span>";
        }
        echo "<br>";

        echo "<script>
                document.getElementById('bar').style.width='$percent%';
                document.getElementById('bar').innerText='$percent%';
                document.getElementById('log').scrollTop=document.getElementById('log').scrollHeight;
              </script>";
        flush();

        sleep(5);
    }

    echo "</div><h3>✅ Upload Completed</h3>";
    unlink($file);
    exit;
}
?>

<form method="POST" enctype="multipart/form-data">
    <input type="file" name="csv_file" accept=".csv" required>
    <br><br>
    <button type="submit">Upload CSV</button>
</form>

</body>
</html>
