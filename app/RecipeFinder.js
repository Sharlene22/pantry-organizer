import React, { useState } from 'react';
import { Container, Button, Box, Typography } from '@mui/material';
import { firestore, collection, getDocs } from './firebase';

export default function RecipeFinder() {
  const [fetchedRecipes, setFetchedRecipes] = useState([]);

  const fetchPantryItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      const pantryItems = [];
      querySnapshot.forEach((doc) => {
        pantryItems.push(doc.data());
      });
      return pantryItems;
    } catch (error) {
      console.error('Error fetching pantry items:', error);
      return [];
    }
  };

  const fetchRecipes = async (pantryItems) => {
    try {
      const ingredients = pantryItems.map(item => item.name).join(',');
      const response = await fetch(`https://api.edamam.com/search?q=${ingredients}&app_id=e33ba68f&app_key=96a70e3a17d2a94ad8a6db26cf94a294`);
      const data = await response.json();
      setFetchedRecipes(data.hits.map(hit => hit.recipe));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleFetchRecipes = async () => {
    const pantryItems = await fetchPantryItems();
    await fetchRecipes(pantryItems);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Recipe Finder</Typography>
      <Box display="flex" justifyContent="center" marginTop={2}>
          <Button variant="contained" color="primary" onClick={handleFetchRecipes} sx={{ mr: 2 }}>
            Find Recipes
          </Button>
        </Box>
        {fetchedRecipes.length > 0 && (
          <Box mt={2} p={2} border={1} borderColor="grey.400" borderRadius={4} bgcolor="white">
            <Typography variant="h6">Suggested Recipes:</Typography>
            {fetchedRecipes.map((recipe, index) => (
              <Box key={index} mt={1}>
                <Typography variant="body1"><strong>Name:</strong> {recipe.label}</Typography>
                <Typography variant="body2"><strong>Ingredients:</strong> {recipe.ingredientLines.join(', ')}</Typography>
                <Typography variant="body2"><strong>Instructions:</strong> <a href={recipe.url} target="_blank" rel="noopener noreferrer">View Recipe</a></Typography>
              </Box>
            ))}
          </Box>
        )}
    </Container>
  );
}
