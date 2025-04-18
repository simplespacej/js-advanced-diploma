import GameStateService from '../GameStateService';
import GamePlay from '../GamePlay';

describe('GameStateService', () => {
  test('успешная загрузка возвращает объект', () => {
    const mockStorage = {
      getItem: jest.fn(() => JSON.stringify({ test: 'data' }))
    };

    const service = new GameStateService(mockStorage);
    const result = service.load();

    expect(result).toEqual({ test: 'data' });
    expect(mockStorage.getItem).toHaveBeenCalledWith('state');
  });

  test('при ошибке парсинга вызывается GamePlay.showError', () => {
    const mockStorage = {
      getItem: jest.fn(() => 'некорректный JSON')
    };

    const service = new GameStateService(mockStorage);

    const showErrorMock = jest.spyOn(GamePlay, 'showError').mockImplementation(() => {});

    try {
      service.load();
    } catch (e) {
      expect(e.message).toBe('Invalid state');
    }

    expect(showErrorMock).not.toHaveBeenCalled();

    showErrorMock.mockRestore();
  });
});
