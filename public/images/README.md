# Organisation des images

## Structure des dossiers

### `/public/images/games/`
Contient les images 360° des jeux à deviner.

**Format recommandé :**
- Images panoramiques/360°
- Format : JPG, PNG, WebP
- Nom de fichier selon le JSON : `witcher3_1.jpg`, `skyrim_1.jpg`, etc.

### `/public/images/maps/`
Contient les cartes des jeux pour la phase de localisation.

**Format recommandé :**
- Carte du monde du jeu
- Format : JPG, PNG
- Nom de fichier selon le JSON : `witcher3_map.jpg`, `skyrim_map.jpg`, etc.

## Utilisation

Les chemins dans `data/games.json` font référence à ces dossiers :
```json
{
  "imageFile": "witcher3_1.jpg",    // → /public/images/games/witcher3_1.jpg
  "mapFile": "witcher3_map.jpg"     // → /public/images/maps/witcher3_map.jpg
}
```

Dans le code, utilisez :
```tsx
// Pour l'image 360°
<img src={`/images/games/${game.imageFile}`} />

// Pour la carte
<img src={`/images/maps/${game.mapFile}`} />
```
