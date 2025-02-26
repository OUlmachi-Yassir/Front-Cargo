import { Alert } from 'react-native';

class ErrorService {
  static handleError(error: unknown): void {
    console.error('Erreur détectée :', error);

    let errorMessage = 'Une erreur inconnue est survenue.';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    }

    Alert.alert('Erreur', errorMessage);
  }
}

export default ErrorService;
