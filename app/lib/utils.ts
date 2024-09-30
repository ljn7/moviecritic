export class ValidationError extends Error {
    constructor(public errors: Record<string, string>) {
      super('Validation Error');
      this.name = 'ValidationError';
    }
  }
  
  export function validateMovie(data: { name?: string; releaseDate?: string }) {
    const errors: Record<string, string> = {};
    
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Movie name is required';
    }
    
    if (!data.releaseDate || isNaN(new Date(data.releaseDate).getTime())) {
      errors.releaseDate = 'Valid release date is required';
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
  }
  
  export function validateReview(data: { movieId?: number; rating?: number; comments?: string }) {
    const errors: Record<string, string> = {};
    
    if (!data.movieId || typeof data.movieId !== 'number') {
      errors.movieId = 'Valid movie ID is required';
    }
    
    if (!data.rating || isNaN(data.rating) || data.rating < 1 || data.rating > 10) {
      errors.rating = 'Rating must be a number between 1 and 10';
    }
    
    if (!data.comments || data.comments.trim() === '') {
      errors.comments = 'Review comments are required';
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }
  }