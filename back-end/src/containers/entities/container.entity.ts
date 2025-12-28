import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ContainerStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  DELETED = 'deleted',
}

@Entity('containers')
export class Container {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ unique: true })
  containerId: string; // Docker container ID

  @Column()
  containerName: string;

  @Column({
    type: 'enum',
    enum: ContainerStatus,
    default: ContainerStatus.RUNNING,
  })
  status: ContainerStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.containers)
  @JoinColumn({ name: 'userId' })
  user: User;
}