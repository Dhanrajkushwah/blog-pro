import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Post } from './models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostServiceService {

  private posts: Post[] = [];
  private postsSubject = new BehaviorSubject<Post[]>([]);

  getPosts() {
    return this.postsSubject.asObservable();

  }

  addPost(post: Post) {
    this.posts.push(post);
    this.postsSubject.next(this.posts);
  }

  updatePost(updatedPost: Post) {
    const index = this.posts.findIndex((post) => post.id === updatedPost.id);
    if (index > -1) {
      this.posts[index] = updatedPost;
      this.postsSubject.next(this.posts);
    }
  }

  deletePost(id: number) {
    this.posts = this.posts.filter((post) => post.id !== id);
    this.postsSubject.next(this.posts);
  }
}
