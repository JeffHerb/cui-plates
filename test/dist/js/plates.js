define(function () { 'use strict';

    const templates = {
        "complex": [
            {
                "node": "elem",
                "attributes": {
                    "class": "simple"
                },
                "tag": "div",
                "children": [
                    {
                        "node": "comment",
                        "children": [
                            {
                                "node": "text",
                                "contents": " Text Comment "
                            }
                        ]
                    },
                    {
                        "node": "elem",
                        "attributes": {},
                        "tag": "p"
                    },
                    {
                        "node": "elem",
                        "attributes": {},
                        "tag": "span",
                        "children": [
                            {
                                "node": "text",
                                "contents": [
                                    "Now to add a text node!"
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "simple": [
            {
                "node": "elem",
                "attributes": {
                    "class": "test",
                    "data-attr": "test2"
                },
                "tag": "div"
            }
        ]
    };

    const Version = "0.0.1";
    const ASTs = templates;

    function plates() {

    	var showVersion = () => {
    		return Version;
    	};

    	var findTemplate = (templateName) => {
    		return (ASTs[templateName]) ? true : false;
    	};

    	return {
    		findTemplate: findTemplate,
    		version: showVersion
    	};

    }

    return plates;

});
