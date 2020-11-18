
// This import is required for jQuery.noConflict to reassign global variables including $
import $ from "jquery";

export class ScriptLoader {
    private scriptQueue: string[];
    private loading: string;
    private readonly onLoadComplete?: () => void;
    private readonly onLoadTimeout?: (string) => void;

    constructor(onLoadComplete?: () => void, onLoadTimeout?: (string) => void) {
        this.scriptQueue = [];
        this.onLoadComplete = onLoadComplete;
        this.onLoadTimeout = onLoadTimeout;
    }

    static restoreJQuery(): void {
        // If any scripts install jQuery, this will return the globally scoped variables to the first loaded version of jQuery
        jQuery.noConflict(true);
    }

    addScript(script: string) {
        this.scriptQueue.push(script);
    }

    private afterLoad(): void {
        this.loading = null;
    }

    // This function will load all scripts in the queue in the order they have been inserted
    load(): boolean {
        const script = this.scriptQueue.shift();
        console.log('Loading script: ' + script);

        // No more scripts
        if (script === undefined) {
            this.afterLoad()
            if (this.onLoadComplete) {
                this.onLoadComplete();
            }
            return false;
        }

        // Sanity check
        if (!script) {
            console.error('Script name is empty');
            this.afterLoad()
            return false;
        }

        // Create script element
        const newElement = document.createElement('script');
        newElement.async = false;
        newElement.src = script;
        this.loading = script;

        // Give feedback if a script is not loading
        const loadTimeout = setTimeout(() => {
            if (this.onLoadTimeout) {
                this.onLoadTimeout(this.loading);
            }
        }, 1000);

        // Add event listener to wait for loaded script
        newElement.addEventListener('load', (evt) => {
            clearTimeout(loadTimeout);
            this.load();
        })

        // Add script to head
        document.head.appendChild(newElement)
    }
}
