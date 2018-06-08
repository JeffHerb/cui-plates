define(function () { 'use strict';

    var templates = {
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

    var Templates = /*#__PURE__*/Object.freeze({
        default: templates
    });

    const JST = Templates;

    console.log(JST);

});
