import { makeAutoObservable } from 'mobx';

class TerminalStore {
  logs: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addLog(log: string) {
    this.logs.push(log);
    this.logs.push("\n")
  }

  clearLogs() {
    this.logs = [];
  }
}

const terminalStore = new TerminalStore();
export default terminalStore;
