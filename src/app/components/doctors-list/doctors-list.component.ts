
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataBaseFacadeService } from '../../services/data-base-facade-service/data-base-facade.service';
import { AuthService } from '../../services/auth-service/auth.service';
import { UserWithId, DoctorRating, DoctorComment , DoctorCommentWithoutId} from '../../interfaces/firestoreTypes';
import { Timestamp } from '@angular/fire/firestore';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../home-page/footer/footer.component";

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './doctors-list.component.html',
  styleUrl: './doctors-list.component.scss'
})
export class DoctorsListComponent {
  private readonly dbFacade = inject(DataBaseFacadeService);
  private authService = inject(AuthService);

  doctors: UserWithId[] = [];
  ratings: { [doctorId: string]: DoctorRating[] } = {};
  comments: { [doctorId: string]: DoctorComment[] } = {};
  replies: { [commentId: string]: DoctorComment[] } = {};
  completedAppointments: { [doctorId: string]: boolean } = {};
  newComments: { [doctorId: string]: string } = {};
  replyContents: { [commentId: string]: string } = {};

  async ngOnInit() {
    this.doctors = await this.dbFacade.getDoctors();
    await this.loadAllData();
  }

  private async loadAllData() {
    for (const doctor of this.doctors) {
      this.ratings[doctor.id] = await this.dbFacade.getDoctorRatings(doctor.id);
      this.comments[doctor.id] = await this.dbFacade.getDoctorComments(doctor.id);
      
      if (this.authService.firebaseAuth.currentUser) {
        this.completedAppointments[doctor.id] = await this.dbFacade.hasCompletedAppointment(
          this.authService.firebaseAuth.currentUser.uid,
          doctor.id
        );
      }
      for (const comment of this.comments[doctor.id]) {
        this.replies[comment.id] = await this.dbFacade.getDoctorCommentReplies(comment.id);
      }
    }
  }

  getLikes(doctorId: string): number {
    return this.ratings[doctorId]?.filter(r => r.isLike).length || 0;
  }

  getDislikes(doctorId: string): number {
    return this.ratings[doctorId]?.filter(r => !r.isLike).length || 0;
  }

  getUserRating(doctorId: string): DoctorRating | undefined {
    if (!this.authService.firebaseAuth.currentUser) return undefined;
    return this.ratings[doctorId]?.find(
      r => r.userId === this.authService.firebaseAuth.currentUser?.uid
    );
  }

  canRate(doctorId: string): boolean {
    return !!this.authService.firebaseAuth.currentUser && 
           this.authService.currentUserSig()?.isBanned === false &&
           this.completedAppointments[doctorId] &&
           this.authService.currentUserSig()?.role === 'patient';
  }
  

  async handleRating(doctorId: string, isLike: boolean) {
    if (this.authService.firebaseAuth.currentUser && this.canRate(this.authService.firebaseAuth.currentUser.uid)){
      const userId = this.authService.firebaseAuth.currentUser.uid;
      const existingRating = this.getUserRating(doctorId);
      
      if (existingRating) {
        if (existingRating.isLike !== isLike) {
          await this.dbFacade.updateDoctorRating(existingRating.id, isLike);
          const ratingIndex = this.ratings[doctorId].findIndex(r => r.id === existingRating.id);
          if (ratingIndex !== -1) {
            this.ratings[doctorId][ratingIndex] = {
              ...existingRating,
              isLike
            };
          }
        }
      } else {
        const newRating = {
          doctorId,
          userId,
          isLike,
          createdAt: Timestamp.now()
        };
        
        const ratingId = await this.dbFacade.addDoctorRating(newRating);
        if (!this.ratings[doctorId]) {
          this.ratings[doctorId] = [];
        }
        this.ratings[doctorId].push({
          ...newRating,
          id: ratingId
        });
      }
    }
    else{
      alert('You must complete an appointment to rate a doctor.');
      return;
    }
  }
  
  getComments(doctorId: string): DoctorComment[] {
    return this.comments[doctorId] || [];
  }
  
  getReplies(commentId: string): DoctorComment[] {
    return this.replies[commentId] || [];
  }
  
  canComment(doctorId: string): boolean {
    return !!this.authService.firebaseAuth.currentUser && 
           this.authService.currentUserSig()?.isBanned === false &&
           this.completedAppointments[doctorId] &&
           this.authService.currentUserSig()?.role === 'patient' ;
  }
  
  isCurrentDoctor(doctorId: string): boolean {
    const currentUser = this.authService.currentUserSig();
    return currentUser?.role === 'doctor' && doctorId === this.authService.firebaseAuth.currentUser?.uid;
  }
  
  async addComment(doctorId: string) {
    if (!this.authService.firebaseAuth.currentUser || !this.newComments[doctorId]) return;
    
    const comment: DoctorCommentWithoutId = {
      doctorId,
      userId: this.authService.firebaseAuth.currentUser.uid,
      content: this.newComments[doctorId],
      createdAt: Timestamp.now(),
      userDisplayName: this.authService.currentUserSig()?.displayName || 'Anonymous',
      isDoctorReply: false
    };
    
    const commentId = await this.dbFacade.addDoctorComment(comment);

    if (!this.comments[doctorId]) {
      this.comments[doctorId] = [];
    }
    this.comments[doctorId].push({
      ...comment,
      id: commentId
    });
    
    this.newComments[doctorId] = '';
  }
  
  async addReply(doctorId: string, commentId: string) {
    if (!this.authService.firebaseAuth.currentUser || !this.replyContents[commentId]) return;
    
    const reply: DoctorCommentWithoutId = {
      doctorId,
      userId: this.authService.firebaseAuth.currentUser.uid,
      content: this.replyContents[commentId],
      createdAt: Timestamp.now(),
      userDisplayName: this.authService.currentUserSig()?.displayName || 'Doctor',
      parentCommentId: commentId,
      isDoctorReply: true
    };
    
    const replyId = await this.dbFacade.addDoctorComment(reply);
    

    if (!this.replies[commentId]) {
      this.replies[commentId] = [];
    }
    this.replies[commentId].push({
      ...reply,
      id: replyId
    });
    
    this.replyContents[commentId] = '';
  }

  isAdmin(): boolean {
    return this.authService.currentUserSig()?.role === 'admin';
  }
  

  async removeComment(commentId: string) {
    await this.dbFacade.removeComment(commentId);
    
    Object.keys(this.comments).forEach(doctorId => {
      this.comments[doctorId] = this.comments[doctorId].filter(c => c.id !== commentId);
    });
    
    delete this.replies[commentId];
    await this.loadAllData();
  }
  private showSuccess(message: string): void {
    alert(message);
  }
  
  private showError(message: string): void {
    alert(message);
  }
  async banUser(userId: string) {
    try {
      await this.dbFacade.banUser(userId);
      await this.loadAllData();
      this.showSuccess('User banned successfully');
    } catch (error) {
      this.showError('Error banning user');
    }
  }

  async unBanUser(userId: string) {
    try {
      await this.dbFacade.unBanUser(userId);
      await this.loadAllData();
      this.showSuccess('User unbanned successfully');
    } catch (error) {
      this.showError('Error unbanning user');
    }
  }
}
