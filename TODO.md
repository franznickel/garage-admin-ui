### Funktionalität
- Bucket erstellen / löschen
- Bucket Einstellungen bearbeiten (Quotas, Website-Konfiguration)
- Bucket Aliases hinzufügen / entfernen
- Key erstellen / löschen
- Key Berechtigungen bearbeiten (AllowBucketKey / DenyBucketKey)
- Admin Token erstellen / löschen
- Staged Cluster Layout Changes anwenden / verwerfen statt immer sofort anzuwenden
- Route Guard für nicht eingeloggte Nutzer

### Seiten & Navigation
- 404 Seite

### UX & Fehlerbehandlung
- Globale Fehleranzeige für 500er (aus ErrorInterceptor)
- Bestätigungsdialog vor destruktiven Aktionen (Löschen)
- Leerzustände für leere Listen (keine Buckets, keine Keys etc.)
- Ladezustände konsistent durchziehen
- Erfolgsmeldungen nach Mutationen

### Technisches
- Route Guard implementieren (isLoggedIn)
- sessionStorage Wiederherstellung beim Reload testen
- Change Detection Problem systematisch lösen (z.B. OnPush Strategie evaluieren)
- Alle Observable<any> durch konkrete Typen ersetzen
