import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostServiceService } from '../post-service.service';
import { Post } from '../models/post.model';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts$: Observable<Post[]> = this.postService.getPosts();
  filteredPosts$: Observable<Post[]> | undefined;
  @ViewChild(MatAccordion) accordion: MatAccordion | undefined;
  searchText: string = '';
  selectedCategories: { [key: string]: boolean } = {};
  categories: string[] = ['Technology', 'Health', 'Lifestyle', 'Education', 'Entertainment'];

  constructor(private postService: PostServiceService, private router: Router) {}

  ngOnInit() {
    this.categories.forEach(category => {
      this.selectedCategories[category] = false;
    });
    this.applyFilters();
  }

  applyFilters() {
    this.filteredPosts$ = this.posts$.pipe(
      map((posts) =>
        posts.filter((post) =>
          (this.searchText === '' ||
            post.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
            post.content.toLowerCase().includes(this.searchText.toLowerCase())) &&
          (Object.keys(this.selectedCategories).some(
            (category) => this.selectedCategories[category] && post.category === category
          ) || Object.keys(this.selectedCategories).every(
            (category) => !this.selectedCategories[category]
          ))
        )
      )
    );
  }
  

  editPost(post: Post) {
    this.router.navigate(['/postform'], { queryParams: { id: post.id } });
  }

  deletePost(postId: number) {
    this.postService.deletePost(postId);
  }
}
