$migrations = @(
    "20241226",
    "20241227",
    "20241228",
    "20250102",
    "20250103",
    "20250103",
    "20250103",
    "20250104",
    "20250105",
    "20250105",
    "20250105",
    "20250105",
    "20250105",
    "20250121",
    "20250122",
    "20250122",
    "20250123184600",
    "20250123184700",
    "20250123210000",
    "20250123",
    "20250123",
    "20250123",
    "20250123",
    "20250123",
    "20250125235720",
    "20250125",
    "20250125",
    "20250125"
)

foreach ($migration in $migrations) {
    Write-Host "Repairing migration: $migration"
    supabase migration repair --status applied $migration
}
