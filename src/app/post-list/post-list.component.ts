import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostServiceService } from '../post-service.service';
import { Post } from '../models/post.model';
import { MatAccordion } from '@angular/material/expansion';
import Swal from 'sweetalert2';

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
    this.categories.forEach((category) => {
      this.selectedCategories[category] = false;
    });
    this.applyFilters(); // Initial filtering
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
          ) ||
            Object.keys(this.selectedCategories).every(
              (category) => !this.selectedCategories[category]
            ))
        )
      )
    );
  }

  onSearchTextChange() {
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  editPost(post: Post) {
    this.router.navigate(['/postform'], { queryParams: { id: post.id } });
  }

  deletePost(postId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this post? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postService.deletePost(postId);
        Swal.fire({
          title: 'Deleted!',
          text: 'The post has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.applyFilters(); // Refresh filtered posts after deletion
      }
    });
  }
}
