// Previous code remains the same, just add this action to the store:

deleteAllSubTasks: (taskId: string) => {
  set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            subTasks: [],
          }
        : task
    ),
  }));
},