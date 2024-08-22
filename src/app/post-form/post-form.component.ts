import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../models/post.model';
import { PostServiceService } from '../post-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

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
  posts$: Observable<Post[]>;

  constructor(
    private fb: FormBuilder,
    private postService: PostServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.posts$ = this.postService.getPosts();
  }

  ngOnInit() {
    // Initialize the form with validation
    this.postForm = this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [null],
    });

    this.route.queryParams.pipe(
      switchMap(params => {
        const postId = params['id'];
        if (postId) {
          return this.posts$.pipe(
            map((posts: Post[]) => posts.find((p: Post) => p.id === +postId) ?? null)
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
      error: (err) => console.error('Error loading post:', err),
    });
  }

  submitPost() {
    if (this.postForm.invalid) {
      // Display validation error message
      Swal.fire({
        title: 'Error!',
        text: 'Please fill in all required fields correctly.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const postValue = this.postForm.value;

    if (this.editing) {
      this.postService.updatePost({ ...postValue, imageUrl: this.selectedImage as string });
      Swal.fire({
        title: 'Success!',
        text: 'Post updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        this.resetForm();
        this.router.navigate(['/postlist']);
      });
    } else {
      this.postService.addPost({ ...postValue, imageUrl: this.selectedImage as string, id: Date.now() });
      Swal.fire({
        title: 'Success!',
        text: 'Post added successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        this.resetForm();
        this.router.navigate(['/postlist']);
      });
    }
  }

  resetForm() {
    this.postForm.reset();
    this.selectedImage = null;
    this.editing = false;
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
