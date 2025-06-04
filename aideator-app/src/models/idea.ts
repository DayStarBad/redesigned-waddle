export interface Idea {
  id: string;
  title: string;
  description: string;
  userId: string; // ID of the user who created the idea
  categoryId?: string; // Optional: ID of the category this idea belongs to
  createdAt: Date;
  updatedAt: Date;
}
