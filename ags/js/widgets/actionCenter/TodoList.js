import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Gtk from 'gi://Gtk';
import MaterialIcon from '../misc/MaterialIcon.js';
import Todo from '../../services/todo.js';
import NavigationIndicator from '../misc/NavigationIndicator.js';
import { setupCursorHover } from '../../lib/cursorHover.js';

const defaultTodoSelected = 'undone';

const todoListItem = (task, id, isDone) => {
    const crosser = Widget.Box({
        className: 'sidebar-todo-crosser',
    });
    const todoContent = Widget.Box({
        className: 'sidebar-todo-item spacing-h-5',
        children: [
            Widget.Label({
                hexpand: true,
                xalign: 0,
                wrap: true,
                className: 'text text-lg sidebar-todo-txt',
                label: task.content,
                selectable: true,
            }),
            Widget.Button({
                vpack: 'center',
                className: 'text sidebar-todo-item-action',
                child: MaterialIcon(`${isDone ? 'remove_done' : 'check'}`, 'xl', { vpack: 'center' }),
                onClicked: () => {
                    const contentWidth = todoContent.get_allocated_width();
                    crosser.toggleClassName('sidebar-todo-crosser-crossed', true);
                    crosser.css = `margin-left: -${contentWidth}px;`;
                    Utils.timeout(200, () => {
                        widgetRevealer.revealChild = false;
                    });
                    Utils.timeout(350, () => {
                        if (isDone) { Todo.uncheck(id); }
                        else { Todo.check(id); }
                    });
                },
                setup: (button) => setupCursorHover(button),
            }),
            Widget.Button({
                vpack: 'center',
                className: 'text sidebar-todo-item-action',
                child: MaterialIcon('delete_forever', 'xl', { vpack: 'center' }),
                onClicked: () => {
                    const contentWidth = todoContent.get_allocated_width();
                    crosser.toggleClassName('sidebar-todo-crosser-removed', true);
                    crosser.css = `margin-left: -${contentWidth}px;`;
                    Utils.timeout(200, () => {
                        widgetRevealer.revealChild = false;
                    });
                    Utils.timeout(350, () => {
                        Todo.remove(id);
                    });
                },
                setup: (button) => setupCursorHover(button),
            }),
            crosser,
        ],
    });
    const widgetRevealer = Widget.Revealer({
        revealChild: true,
        transition: 'slide_down',
        transitionDuration: 150,
        child: todoContent,
    });
    return widgetRevealer;
};

const todoItems = (isDone) => Widget.Scrollable({
    child: Widget.Box({
        vertical: true,
        setup: (self) => self.hook(Todo, (self) => {
            self.children = Todo.todo_json.map((task, i) => {
                if (task.done != isDone) {
                    return null;
                }
                return todoListItem(task, i, isDone);
            });
            if (self.children.length == 0) {
                self.homogeneous = true;
                self.children = [
                    Widget.Box({
                        hexpand: true,
                        vertical: true,
                        vpack: 'center',
                        className: 'text',
                        children: [
                            MaterialIcon(`${isDone ? 'checklist' : 'check_circle'}`, '5xl'),
                            Widget.Label({ label: `${isDone ? 'Finished tasks will go here' : 'Nothing here!'}` }),
                        ],
                    }),
                ];
            }
            else {
                self.homogeneous = false;
            }
        }, 'updated')
    }),
    setup: (listContents) => {
        listContents.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        const vScrollbar = listContents.get_vscrollbar();
        vScrollbar.get_style_context().add_class('sidebar-scrollbar');
    },
});

const UndoneTodoList = () => {
    const newTaskButton = Widget.Revealer({
        transition: 'slide_left',
        transitionDuration: 200,
        revealChild: true,
        child: Widget.Button({
            className: 'text-lg sidebar-todo-new',
            halign: 'end',
            vpack: 'center',
            label: '+ New task',
            setup: (button) => setupCursorHover(button),
            onClicked: () => {
                newTaskButton.revealChild = false;
                newTaskEntryRevealer.revealChild = true;
                confirmAddTask.revealChild = true;
                cancelAddTask.revealChild = true;
                newTaskEntry.grab_focus();
            },
        }),
    });
    const cancelAddTask = Widget.Revealer({
        transition: 'slide_right',
        transitionDuration: 200,
        revealChild: false,
        child: Widget.Button({
            className: 'text-xl icon-material sidebar-todo-add',
            halign: 'end',
            vpack: 'center',
            label: 'close',
            setup: (button) => setupCursorHover(button),
            onClicked: () => {
                newTaskEntryRevealer.revealChild = false;
                confirmAddTask.revealChild = false;
                cancelAddTask.revealChild = false;
                newTaskButton.revealChild = true;
                newTaskEntry.text = '';
            },
        }),
    });
    const newTaskEntry = Widget.Entry({
        vpack: 'center',
        className: 'text-lg sidebar-todo-entry',
        placeholderText: 'Add a task...',
        onAccept: ({ text }) => {
            if (text == '') {
                return;
            }
            Todo.add(text);
            newTaskEntry.text = '';
        },
        onChange: ({ text }) => confirmAddTask.child.toggleClassName('sidebar-todo-add-available', text != ''),
    });
    const newTaskEntryRevealer = Widget.Revealer({
        transition: 'slide_right',
        transitionDuration: 200,
        revealChild: false,
        child: newTaskEntry,
    });
    const confirmAddTask = Widget.Revealer({
        transition: 'slide_right',
        transitionDuration: 200,
        revealChild: false,
        child: Widget.Button({
            className: 'text-lg icon-material sidebar-todo-add',
            halign: 'end',
            vpack: 'center',
            label: 'arrow_upward',
            setup: (button) => setupCursorHover(button),
            onClicked: () => {
                if (newTaskEntry.text == '') {
                    return;
                }
                Todo.add(newTaskEntry.text);
                newTaskEntry.text = '';
            },
        }),
    });
    return Widget.Box({
        vertical: true,
        className: 'spacing-v-5',
        setup: (self) => {
            self.pack_start(todoItems(false), true, true, 0);
            self.pack_start(Widget.Box({
                setup: (self) => {
                    self.pack_start(cancelAddTask, false, false, 0);
                    self.pack_start(newTaskEntryRevealer, true, true, 0);
                    self.pack_start(confirmAddTask, false, false, 0);
                    self.pack_start(newTaskButton, false, false, 0);
                },
            }), false, false, 0);
            self.hook(App, (_, name) => {
                if (name !== 'overview') {
                    return;
                }

                newTaskEntryRevealer.revealChild = false;
                confirmAddTask.revealChild = false;
                cancelAddTask.revealChild = false;
                newTaskButton.revealChild = true;
                newTaskEntry.text = '';
            })
        },
    });
};

const todoItemsBox = Widget.Stack({
    vpack: 'fill',
    transition: 'slide_left_right',
    children: {
        undone: UndoneTodoList(),
        done: todoItems(true),
    }
});

export default () => {
    const TodoTabButton = (isDone, navIndex) => Widget.Button({
        hexpand: true,
        className: 'sidebar-todo-selector-tab',
        onClicked: (button) => {
            todoItemsBox.shown = `${isDone ? 'done' : 'undone'}`;
            const kids = button.get_parent().get_children();
            for (let i = 0; i < kids.length; i++) {
                if (kids[i] != button) { kids[i].toggleClassName('sidebar-todo-selector-tab-active', false); }
                else { button.toggleClassName('sidebar-todo-selector-tab-active', true); }
            }
            const buttonWidth = button.get_allocated_width();
            const highlightWidth = button.get_children()[0].get_allocated_width();
            navIndicator.css = `
                font-size: ${navIndex}px; 
                padding: 0px ${(buttonWidth - highlightWidth) / 2}px;
            `;
        },
        child: Widget.Box({
            hpack: 'center',
            className: 'spacing-h-5',
            children: [
                MaterialIcon(`${isDone ? 'task_alt' : 'format_list_bulleted'}`, '2xl'),
                Widget.Label({
                    className: 'text text-base',
                    label: `${isDone ? 'Done' : 'Unfinished'}`,
                }),
            ],
        }),
        setup: (button) => Utils.timeout(1, () => {
            button.toggleClassName('sidebar-todo-selector-tab-active', defaultTodoSelected === `${isDone ? 'done' : 'undone'}`);
            setupCursorHover(button);
        }),
    });
    const undoneButton = TodoTabButton(false, 0);
    const doneButton = TodoTabButton(true, 1);
    const navIndicator = NavigationIndicator(2, false, {
        className: 'sidebar-todo-selector-highlight',
        css: 'font-size: 0px;',
    });
    return Widget.Box({
        hexpand: true,
        vertical: true,
        className: 'spacing-v-10',
        setup: (box) => Utils.timeout(1, () => {
            box.pack_start(Widget.Box({
                vertical: true,
                children: [
                    Widget.Box({
                        className: 'sidebar-todo-selectors spacing-h-5',
                        homogeneous: true,
                        setup: (box) => {
                            box.pack_start(undoneButton, false, true, 0);
                            box.pack_start(doneButton, false, true, 0);
                        },
                    }),
                    Widget.Box({
                        className: 'sidebar-todo-selector-highlight-offset',
                        homogeneous: true,
                        children: [navIndicator],
                    }),
                ],
            }), false, false, 0);
            box.pack_end(todoItemsBox, true, true, 0);
        }),
    });
};
