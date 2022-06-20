import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
 
@Entity()
export class Encrypted2fa {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ default: ''})
  login42: string;

  @Column()
  email: string;

  @Column({nullable: true })
  authConfirmToken: string

  @Column({ default: false, nullable: true })
  isVerified: Boolean;

  @CreateDateColumn()
  createdAt: Date;   
}