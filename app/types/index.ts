export interface Movie {
    id: number;
    name: string;
    releaseDate: Date;
    averageRating: number | null;
  }
  
  export interface Review {
    id: number;
    movieId: number;
    userId: number;
    rating: number;
    comments: string;
  }
  
  export interface User {
    id: number;
    username: string;
  }
  
  export interface ReviewWithUser extends Review {
    user: User | null;
    }