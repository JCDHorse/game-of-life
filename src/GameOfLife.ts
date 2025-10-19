type bufferIndex = 1 | 2;

export default class GameOfLife {
    private static readonly NEIGHBOURS_OFFSETS: { x: number; y: number }[] = [
        { x: -1, y: -1 },   { x: 0, y: -1 },    { x: 1, y: -1 },
        { x: -1, y: 0  },                       { x: 1, y: 0  },
        { x: -1, y: 1  },   { x: 0, y: 1  },    { x: 1, y: 1  },
    ];

    private readonly width: number;
    private readonly height: number;

    private readonly buffer1: boolean[][];
    private readonly buffer2: boolean[][];
    private currentBuffer: bufferIndex;

    public constructor(width: number, height: number, density: number = 0.5) {
        this.width = width;
        this.height = height;
        this.currentBuffer = 1;
        this.buffer1 = this.initGrid();
        this.buffer2 = this.initGrid();
        this.randomGame(density);
    }

    public tick(): void {
        this.prepareNextBuffer();
        this.switchBuffer();
    }

    public randomGame(density: number = 0.5) {
        this.currentBuffer = 1;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.setCellState(j, i, Math.random() < density);
            }
        }
    }

    public getGrid(): boolean[][] {
        return this.getBuffer();
    }

    public cellState(x: number, y: number): boolean {
        if (!this.isInBounds(x, y)) {
            throw new Error(`cellState: Cell coordinates out of bounds {x: ${x}, y: ${y}, w: ${this.width}, h: ${this.height}`);
        }
        return this.getBuffer()[y]![x]!;
    }

    public setCellState(x: number, y: number, state: boolean): void {
        if (!this.isInBounds(x, y)) {
            throw new Error(`setCellState: Cell coordinates out of bounds {x: ${x}, y: ${y}, w: ${this.width}, h: ${this.height}`);
        }
        this.getBuffer()[y]![x]! = state;
    }

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    private countNeighbours(x: number, y: number): number {
        let neighbours = 0;
        for (const offset of GameOfLife.NEIGHBOURS_OFFSETS) {
            const cellY = y + offset.y;
            const cellX = x + offset.x;
            if (this.isInBounds(cellX, cellY)) {
                let cell = this.cellState(cellX, cellY);
                neighbours += +cell;
            }
        }
        return neighbours;
    }

    private prepareNextBuffer() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const neighbours = this.countNeighbours(x, y);
                const alive = this.cellState(x, y);
                this.getNextBuffer()[y]![x]! = alive ? neighbours == 2 || neighbours == 3 : neighbours == 3;
            }
        }
    }

    private switchBuffer() {
        this.currentBuffer = this.currentBuffer == 1 ? 2 : 1;
    }

    private initGrid(): boolean[][] {
        return Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => false)
        );
    }

    private getBuffer() {
        switch (this.currentBuffer) {
            case 1:
                return this.buffer1;
            case 2:
                return this.buffer2;
        }
    }

    private getNextBuffer(): boolean[][] {
        switch (this.currentBuffer) {
            case 1:
                return this.buffer2;
            case 2:
                return this.buffer1;
        }
    }
}