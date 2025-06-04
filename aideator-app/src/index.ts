import express from 'express';
import logger from './utils/logger';
import { User } from './models/user';
import { Idea } from './models/idea';
import { Category } from './models/category';
import bcrypt from 'bcrypt';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Mock in-memory user store
const users: User[] = [];

// Mock in-memory idea store
const ideas: Idea[] = [];

// Mock in-memory category store
const categories: Category[] = [
  { id: 'cat_1', name: 'General', description: 'Default category for miscellaneous ideas.' },
  { id: 'cat_2', name: 'Technology', description: 'Ideas related to software, hardware, gadgets, etc.' },
  { id: 'cat_3', name: 'Personal', description: 'Ideas for personal projects, self-improvement, etc.' },
];

// A simple in-memory store for our data (placeholder for now)
interface Item {
  id: string;
  name: string;
}
const items: Item[] = [];

logger.info('Setting up basic CRUD routes for /items...');

// Create a new item
app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    logger.warn('Item creation failed: Name is required');
    return res.status(400).send('Name is required');
  }
  const newItem: Item = { id: Date.now().toString(), name };
  items.push(newItem);
  logger.info(`Item created: ${newItem.id} - ${newItem.name}`);
  res.status(201).send(newItem);
});

// Get all items
app.get('/items', (_req, res) => {
  logger.info('All items retrieved');
  res.json(items);
});

// Get a specific item
app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (item) {
    logger.info(`Item retrieved: ${item.id}`);
    res.json(item);
  } else {
    logger.warn(`Item not found: ${req.params.id}`);
    res.status(404).send('Item not found');
  }
});

// Update an item
app.put('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    items[index] = { ...items[index], ...req.body };
    logger.info(`Item updated: ${items[index].id}`);
    res.json(items[index]);
  } else {
    logger.warn(`Update failed: Item not found: ${req.params.id}`);
    res.status(404).send('Item not found');
  }
});

// Delete an item
app.delete('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  if (index !== -1) {
    const deletedItem = items.splice(index, 1);
    logger.info(`Item deleted: ${deletedItem[0].id}`);
    res.status(204).send();
  } else {
    logger.warn(`Delete failed: Item not found: ${req.params.id}`);
    res.status(404).send('Item not found');
  }
});

logger.info('/items routes configured.');

// User Authentication Routes
logger.info('Setting up /auth routes...');

app.post('/auth/register', async (req, res) => {
  logger.info('POST /auth/register attempt initiated.');
  const { username, password } = req.body;

  // Input Validation
  if (!username || !password) {
    logger.warn('Registration failed: Username and password are required.');
    return res.status(400).send({ message: 'Username and password are required.' });
  }
  if (username.length < 3) {
    logger.warn(`Registration failed: Username too short for "${username}".`);
    return res.status(400).send({ message: 'Username must be at least 3 characters long.' });
  }
  if (password.length < 6) {
    logger.warn('Registration failed: Password too short.');
    return res.status(400).send({ message: 'Password must be at least 6 characters long.' });
  }

  // Check for Existing User
  if (users.find(u => u.username === username)) {
    logger.warn(`Registration failed: Username "${username}" already exists.`);
    return res.status(409).send({ message: 'Username already exists.' });
  }

  try {
    // Hash Password
    const saltRounds = 10;
    logger.info(`Hashing password for user "${username}" with ${saltRounds} salt rounds.`);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    logger.info(`Password hashed successfully for user "${username}".`);

    // Store User
    const newUser: User = {
      id: Date.now().toString(),
      username,
      passwordHash,
    };
    users.push(newUser);
    logger.info(`User "${username}" created successfully with id ${newUser.id}.`);

    // Exclude passwordHash from the response
    const userResponse = { id: newUser.id, username: newUser.username };
    return res.status(201).send(userResponse);

  } catch (error) {
    logger.error(`Error during registration for user "${username}": ${error}`);
    return res.status(500).send({ message: 'Internal server error during registration.' });
  }
});

app.post('/auth/login', async (req, res) => {
  logger.info('POST /auth/login attempt initiated.');
  const { username, password } = req.body;

  // Input Validation
  if (!username || !password) {
    logger.warn('Login failed: Username and password are required.');
    return res.status(400).send({ message: 'Username and password are required.' });
  }

  try {
    // Find User
    const user = users.find(u => u.username === username);
    if (!user) {
      logger.warn(`Login failed: User "${username}" not found.`);
      return res.status(401).send({ message: 'Invalid credentials.' }); // Generic message
    }
    logger.info(`User "${username}" found. Proceeding with password comparison.`);

    // Compare Password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      logger.warn(`Login failed: Password incorrect for user "${username}".`);
      return res.status(401).send({ message: 'Invalid credentials.' }); // Generic message
    }

    // Login Success
    logger.info(`User "${username}" logged in successfully.`);
    // In a real app, you would generate a token here (e.g., JWT)
    return res.status(200).send({ message: 'Login successful', userId: user.id });

  } catch (error) {
    logger.error(`Error during login for user "${username}": ${error}`);
    return res.status(500).send({ message: 'Internal server error during login.' });
  }
});

logger.info('/auth routes configured.');

// Idea Management Routes
logger.info('Setting up /ideas routes...');

app.post('/ideas', (req, res) => {
  logger.info('POST /ideas attempt initiated.');
  const { title, description, categoryId } = req.body;

  // Input Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    logger.warn('Idea creation failed: Title is required and must be a non-empty string.');
    return res.status(400).send({ message: 'Title is required and must be a non-empty string.' });
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    logger.warn('Idea creation failed: Description is required and must be a non-empty string.');
    return res.status(400).send({ message: 'Description is required and must be a non-empty string.' });
  }
  if (categoryId && typeof categoryId !== 'string') {
    logger.warn('Idea creation failed: categoryId, if provided, must be a string.');
    return res.status(400).send({ message: 'categoryId, if provided, must be a string.' });
  }
  if (categoryId && !categories.find(c => c.id === categoryId)) {
    logger.warn(`Idea creation failed: Category with ID "${categoryId}" not found.`);
    return res.status(400).send({ message: `Category with ID "${categoryId}" not found.` });
  }

  // Create new Idea object
  const newIdea: Idea = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description.trim(),
    userId: "mockUserId", // Placeholder - replace with actual userId from auth later
    categoryId: categoryId || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  ideas.push(newIdea);
  logger.info(`New idea created with ID: ${newIdea.id} by user ${newIdea.userId}${newIdea.categoryId ? ` in category ${newIdea.categoryId}` : ''}.`);
  return res.status(201).send(newIdea);
});

app.get('/ideas', (req, res) => {
  logger.info('GET /ideas request received. Returning all ideas.');
  res.status(200).json(ideas);
});

app.get('/ideas/:id', (req, res) => {
  const { id } = req.params;
  logger.info(`GET /ideas/${id} request received.`);
  const idea = ideas.find(i => i.id === id);

  if (idea) {
    logger.info(`Idea with ID: ${id} found.`);
    res.status(200).json(idea);
  } else {
    logger.warn(`Idea with ID: ${id} not found.`);
    res.status(404).send({ message: 'Idea not found.' });
  }
});

app.put('/ideas/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, categoryId } = req.body;
  logger.info(`PUT /ideas/${id} attempt initiated.`);

  const ideaIndex = ideas.findIndex(i => i.id === id);

  if (ideaIndex === -1) {
    logger.warn(`Update failed: Idea with ID: ${id} not found.`);
    return res.status(404).send({ message: 'Idea not found.' });
  }

  // Input Validation
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    logger.warn(`Update failed for ID ${id}: Title, if provided, must be a non-empty string.`);
    return res.status(400).send({ message: 'Title, if provided, must be a non-empty string.' });
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    logger.warn(`Update failed for ID ${id}: Description, if provided, must be a non-empty string.`);
    return res.status(400).send({ message: 'Description, if provided, must be a non-empty string.' });
  }
  if (categoryId !== undefined) {
    if (categoryId === null) { // Allow unsetting the category
      ideas[ideaIndex].categoryId = undefined;
    } else if (typeof categoryId !== 'string') {
      logger.warn(`Update failed for ID ${id}: categoryId, if provided, must be a string or null.`);
      return res.status(400).send({ message: 'categoryId, if provided, must be a string or null.' });
    } else if (!categories.find(c => c.id === categoryId)) {
      logger.warn(`Update failed for ID ${id}: Category with ID "${categoryId}" not found.`);
      return res.status(400).send({ message: `Category with ID "${categoryId}" not found.` });
    } else {
      ideas[ideaIndex].categoryId = categoryId;
    }
  }


  // Update the idea's properties
  if (title) {
    ideas[ideaIndex].title = title.trim();
  }
  if (description) {
    ideas[ideaIndex].description = description.trim();
  }
  ideas[ideaIndex].updatedAt = new Date();
  // In a real app, you'd also check if the authenticated user owns this idea.

  logger.info(`Idea with ID: ${id} updated successfully.${categoryId !== undefined ? ` Category set to ${ideas[ideaIndex].categoryId}` : ''}`);
  return res.status(200).json(ideas[ideaIndex]);
});

app.delete('/ideas/:id', (req, res) => {
  const { id } = req.params;
  logger.info(`DELETE /ideas/${id} attempt initiated.`);

  const ideaIndex = ideas.findIndex(i => i.id === id);

  if (ideaIndex === -1) {
    logger.warn(`Delete failed: Idea with ID: ${id} not found.`);
    return res.status(404).send({ message: 'Idea not found.' });
  }

  // In a real app, you'd also check if the authenticated user owns this idea.
  ideas.splice(ideaIndex, 1);

  logger.info(`Idea with ID: ${id} deleted successfully.`);
  return res.status(204).send();
});

logger.info('/ideas routes configured.');

// AI Suggestion Route (Mocked)
app.post('/ideas/:id/suggest', (req, res) => {
  const { id } = req.params;
  logger.info(`POST /ideas/${id}/suggest attempt initiated.`);

  const idea = ideas.find(i => i.id === id);
  if (!idea) {
    logger.warn(`Suggestion request failed: Idea with ID: ${id} not found.`);
    return res.status(404).send({ message: 'Idea not found.' });
  }

  // Mock Suggestion Generation (dynamic based on idea title)
  const suggestionText = `Regarding your idea titled '${idea.title}': Have you considered exploring potential user engagement strategies or alternative monetization models?`;

  const suggestion = { suggestionText };

  logger.info(`Generated suggestion for Idea ID ${id}: "${suggestionText}"`);
  res.status(200).json(suggestion);
});

// Category Management Routes
logger.info('Setting up /categories routes...');

app.post('/categories', (req, res) => {
  logger.info('POST /categories attempt initiated.');
  const { name, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    logger.warn('Category creation failed: Name is required and must be a non-empty string.');
    return res.status(400).send({ message: 'Name is required and must be a non-empty string.' });
  }
  if (description && typeof description !== 'string') {
    logger.warn('Category creation failed: Description, if provided, must be a string.');
    return res.status(400).send({ message: 'Description, if provided, must be a string.' });
  }

  const newCategory: Category = {
    id: `cat_${Date.now().toString()}`, // Prefix to distinguish from other IDs
    name: name.trim(),
    description: description ? description.trim() : undefined,
  };
  categories.push(newCategory);
  logger.info(`New category created: ${newCategory.name} (ID: ${newCategory.id})`);
  res.status(201).send(newCategory);
});

app.get('/categories', (req, res) => {
  logger.info('GET /categories request received. Returning all categories.');
  res.status(200).json(categories);
});

app.get('/categories/:id', (req, res) => {
  const { id } = req.params;
  logger.info(`GET /categories/${id} request received.`);
  const category = categories.find(c => c.id === id);

  if (category) {
    logger.info(`Category with ID: ${id} found (${category.name}).`);
    res.status(200).json(category);
  } else {
    logger.warn(`Category with ID: ${id} not found.`);
    res.status(404).send({ message: 'Category not found.' });
  }
});

app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  logger.info(`PUT /categories/${id} attempt initiated.`);

  const categoryIndex = categories.findIndex(c => c.id === id);

  if (categoryIndex === -1) {
    logger.warn(`Update category failed: Category with ID: ${id} not found.`);
    return res.status(404).send({ message: 'Category not found.' });
  }

  // Validate name (must be non-empty string if provided)
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      logger.warn(`Update category ${id} failed: Name, if provided, must be a non-empty string.`);
      return res.status(400).send({ message: 'Name, if provided, must be a non-empty string.' });
    }
    categories[categoryIndex].name = name.trim();
  }

  // Validate description (must be string if provided, can be set to undefined/null to clear it)
  if (description !== undefined) {
    if (description === null || description.trim() === '') {
      categories[categoryIndex].description = undefined;
    } else if (typeof description !== 'string') {
      logger.warn(`Update category ${id} failed: Description, if provided, must be a string or null.`);
      return res.status(400).send({ message: 'Description, if provided, must be a string or null.' });
    } else {
      categories[categoryIndex].description = description.trim();
    }
  }

  logger.info(`Category ${id} "${categories[categoryIndex].name}" updated successfully.`);
  res.status(200).json(categories[categoryIndex]);
});

app.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  logger.info(`DELETE /categories/${id} attempt initiated.`);

  const categoryIndex = categories.findIndex(c => c.id === id);

  if (categoryIndex === -1) {
    logger.warn(`Delete category failed: Category with ID: ${id} not found.`);
    return res.status(404).send({ message: 'Category not found.' });
  }

  const deletedCategoryName = categories[categoryIndex].name;
  categories.splice(categoryIndex, 1);
  logger.info(`Category ID: ${id} ("${deletedCategoryName}") deleted successfully.`);

  // Decategorize ideas that belonged to the deleted category
  let decategorizedCount = 0;
  ideas.forEach(idea => {
    if (idea.categoryId === id) {
      idea.categoryId = undefined;
      decategorizedCount++;
      logger.info(`Idea ID: ${idea.id} decategorized (was category ${id}).`);
    }
  });
  if (decategorizedCount > 0) {
    logger.info(`${decategorizedCount} idea(s) were decategorized due to deletion of category ${id}.`);
  }

  res.status(204).send();
});

logger.info('/categories routes configured.');

app.get('/', (_req, res) => {
  logger.info('Hello AIdeator! Root endpoint hit.');
  res.send('Hello AIdeator by AI_Developer_01!');
});

app.listen(port, () => {
  logger.info(`AIdeator app listening on port ${port}`);
});

export default app; // Export app for testing purposes
