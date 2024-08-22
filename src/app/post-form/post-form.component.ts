import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../models/post.model';
import { PostServiceService } from '../post-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
})
export class PostFormComponent implements OnInit {
  postForm!: FormGroup;
  editing: boolean = false;
  selectedImage: string | ArrayBuffer | null = null;
  categories: string[] = ['Technology', 'Health', 'Lifestyle', 'Education', 'Entertainment'];
  posts$: Observable<Post[]>;  // Observable to hold the list of posts

  constructor(
    private fb: FormBuilder,
    private postService: PostServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.posts$ = this.postService.getPosts();  // Initialize the posts Observable
  }

  ngOnInit() {
    this.postForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      category: ['', Validators.required],
      content: ['', Validators.required],
      imageUrl: [null],
    });

    this.route.queryParams.pipe(
      switchMap(params => {
        const postId = params['id'];
        if (postId) {
          return this.posts$.pipe(
            map((posts: Post[]) => posts.find((p: Post) => p.id === +postId) ?? null)  // Ensure we return null if not found
          );
        }
        return [null];
      })
    ).subscribe({
      next: (post: Post | null) => {
        if (post) {
          this.loadPostForEdit(post);
        }
      },
      error: (err) => {
        console.error('Error loading post:', err);
      }
    });
  }

  submitPost() {
    const postValue = this.postForm.value;
    if (this.editing) {
      this.postService.updatePost({ ...postValue, imageUrl: this.selectedImage as string });
    } else {
      this.postService.addPost({ ...postValue, imageUrl: this.selectedImage as string, id: Date.now() });
    }
    this.resetForm();
    this.router.navigate(['/postlist']);
  }

  resetForm() {
    this.postForm.reset();
    this.selectedImage = null;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  loadPostForEdit(post: Post) {
    this.postForm.patchValue(post);
    this.selectedImage = post.imageUrl ?? null;
    this.editing = true;
  }
}
