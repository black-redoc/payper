import { UserEntity } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async signUp(data: SignUpData): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Email inválido');
    }

    // Validate password length
    if (data.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Validate password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      throw new Error(
        'La contraseña debe contener mayúsculas, minúsculas y números'
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = UserEntity.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }
}
