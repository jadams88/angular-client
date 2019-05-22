import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Todo } from '@app/features/todos';
import { TodoDetailComponent } from './todo-detail.component';
import { ReactiveFormsModule } from '@angular/forms';
import { createSpyObj } from '~/tests';
import { TodosFacade } from '../../services/todos.facade';
import { cold, Scheduler, hot } from 'jest-marbles';
import { of } from 'rxjs';
import { MatSlideToggleModule } from '@angular/material';

describe('TodoDetailComponent', () => {
  let component: TodoDetailComponent;
  let fixture: ComponentFixture<TodoDetailComponent>;
  let debugEl: DebugElement;
  let nativeEl: HTMLElement;
  let todoFacade: TodosFacade;

  const todoFacadeSpy = createSpyObj('TodosFacade', [
    'userTodo$',
    'loadTodos',
    'selectTodo',
    'saveTodo',
    'deleteTodo',
    'clearSelected'
  ]);
  todoFacadeSpy.selectedTodo$ = of(jest.fn());

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSlideToggleModule],
      providers: [{ provide: TodosFacade, useValue: todoFacadeSpy }],
      declarations: [TodoDetailComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    todoFacade = TestBed.get(TodosFacade);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoDetailComponent);
    component = fixture.componentInstance;
    debugEl = fixture.debugElement;
    nativeEl = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saved', () => {
    it('should be raised when the saved button is clicked', () => {
      const todo: Todo = {
        id: '1',
        user: '1',
        title: 'some title',
        description: 'some description',
        completed: false
      };

      const formValues = {
        description: 'undated description',
        title: 'some new title',
        completed: true
      };

      const updatedTodo = { ...todo, ...formValues };

      // const resetFormValues = { description: null, title: null, completed: false };

      component.selectedTodo$ = of(todo);
      component.todoForm.reset(formValues);

      fixture.detectChanges();

      expect(component.todoForm.value).toEqual(formValues);

      let emittedTodo: Todo;
      component.saved.subscribe(event => {
        emittedTodo = event;
      });

      debugEl.query(By.css('form')).triggerEventHandler('submit', null);

      expect(emittedTodo).toEqual(updatedTodo);
    });
  });

  describe('cancelled', () => {
    it('should be raised when the canceled button is clicked', () => {
      let canceledEvent = true;
      component.cancelled.subscribe(event => {
        canceledEvent = event;
      });

      fixture.detectChanges();

      expect(canceledEvent).toBeDefined();

      const deleteButton = debugEl.query(By.css('button[type="button"]'));
      deleteButton.triggerEventHandler('click', null);

      expect(canceledEvent).toBeUndefined();
    });
  });
});
