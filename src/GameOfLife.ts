type LifeChange = {
    x: number;
    y: number;
    newState: boolean;
}

export default class GameOfLife {
    private static readonly NEIGHBOURS_OFFSETS: { x: number; y: number }[] = [
        { x: -1, y: -1 },   { x: 0, y: -1 },    { x: 1, y: -1 },
        { x: -1, y: 0  },                       { x: 1, y: 0  },
        { x: -1, y: 1  },   { x: 0, y: 1  },    { x: 1, y: 1  },
    ];

    private readonly width: number;
    private readonly height: number;
    private readonly grid: boolean[][];

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.grid = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => false)
        );
    }

    public tick(): void {
        const changes = this.getChanges();

        for (let change of changes) {
            this.setCellState(change.x, change.y, change.newState);
        }
    }

    public cellState(x: number, y: number): boolean {
        if (!this.isInBounds(x, y)) {
            throw new Error("cellState: Cell coordinates out of bounds");
        }
        return this.grid[y][x];
    }

    public setCellState(x: number, y: number, state: boolean): void {
        if (!this.isInBounds(x, y)) {
            throw new Error("setCellState: Cell coordinates out of bounds");
        }
        this.grid[y][x] = state;
    }

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    private getChanges(): LifeChange[] {
        const changes: LifeChange[] = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let neighbours = this.countNeighbours(x, y);
                if (this.cellState(x, y)) {
                    if (neighbours < 2 || neighbours > 3) {
                        changes.push({ x: x, y: y, newState: false });
                    }
                }
                else {
                    if (neighbours == 3) {
                        changes.push({ x: x, y: y, newState: true });
                    }
                }
            }
        }
        return changes;
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

}